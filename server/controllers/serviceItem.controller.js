const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");

const serviceItemCollection = dbCollections.serviceItemCollection;
const serviceCollection = dbCollections.serviceCollection;
const counterCollection = dbCollections.counterCollection;

// Item numbers are offset so the first one reads as a 4-digit code (1001)
const ITEM_NUMBER_BASE = 1000;

// Allocate the next customer-facing item number.
// Uses an atomic $inc on a shared counter rather than counting documents, so
// two admins adding items at the same moment can never get the same number.
const getNextItemNumber = async () => {
  const res = await counterCollection.findOneAndUpdate(
    { _id: "serviceItemNumber" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  // Driver 6 returns the document directly; guard for the metadata shape too.
  const doc =
    res && Object.prototype.hasOwnProperty.call(res, "value") ? res.value : res;
  return ITEM_NUMBER_BASE + (doc?.seq || 1);
};

const DEFAULT_SWIPER_DELAY = 3000;
const STAT_COUNT = 4;
const DEFAULT_LIMIT = 20;
// admins may configure a page size up to this
const MAX_LIMIT = 100;

// Helper: wa.me links accept digits only — no "+", spaces or dashes.
// The admin is responsible for including the country code (e.g. 8801712345678).
const sanitizeWhatsappNumber = (value) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).replace(/\D/g, "")
    : "";

// Helper: coerce an "active" flag, defaulting to true when absent.
// Treats the strings "false"/"0" as false so a loosely-typed client cannot
// accidentally re-activate an item it meant to hide.
const toBool = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") {
    return value !== "false" && value !== "0" && value !== "";
  }
  return value !== false;
};

// Helper: build the public browse filter from query params
const buildBrowseFilter = (query) => {
  const { serviceId, priceMin, priceMax, sold } = query;
  const filter = {
    serviceId: new ObjectId(serviceId),
    isActive: { $ne: false },
    // `sold=true` powers the "recently sold" showcase; anything else lists
    // what is still on sale. Hidden items are excluded from both.
    isSold: sold === "true" ? true : { $ne: true },
  };

  // Per-stat numeric range filters (stat1..stat4 map to stats.0..stats.3)
  for (let i = 0; i < STAT_COUNT; i++) {
    const min = query[`stat${i + 1}Min`];
    const max = query[`stat${i + 1}Max`];
    const range = {};
    if (min !== undefined && min !== "" && !isNaN(parseFloat(min))) {
      range.$gte = parseFloat(min);
    }
    if (max !== undefined && max !== "" && !isNaN(parseFloat(max))) {
      range.$lte = parseFloat(max);
    }
    if (Object.keys(range).length > 0) {
      filter[`stats.${i}`] = range;
    }
  }

  // Price range filter (always applied against offerPrice — the effective price)
  const priceRange = {};
  if (priceMin !== undefined && priceMin !== "" && !isNaN(parseFloat(priceMin))) {
    priceRange.$gte = parseFloat(priceMin);
  }
  if (priceMax !== undefined && priceMax !== "" && !isNaN(parseFloat(priceMax))) {
    priceRange.$lte = parseFloat(priceMax);
  }
  if (Object.keys(priceRange).length > 0) {
    filter.offerPrice = priceRange;
  }

  return filter;
};

// Helper: resolve the sort stage from the `sort` query param
const buildSort = (sort) => {
  if (sort === "priceAsc") {
    return { offerPrice: 1, _id: 1 };
  }
  if (sort === "priceDesc") {
    return { offerPrice: -1, _id: 1 };
  }
  return { serial: -1, _id: -1 };
};

// Helper: normalize an incoming stats array into exactly 4 numbers
const normalizeStats = (stats) => {
  if (!Array.isArray(stats) || stats.length !== STAT_COUNT) {
    return null;
  }
  const normalized = stats.map((s) => parseFloat(s));
  if (normalized.some((n) => isNaN(n))) {
    return null;
  }
  return normalized;
};

// GET /serviceItems?serviceId=&page=&limit=&sort=&sold=&stat1Min=&...&priceMin=&priceMax=
const getServiceItems = async (req, res) => {
  try {
    const { serviceId, page, limit, sort, sold } = req.query;
    if (!serviceId) {
      return res
        .status(400)
        .send({ success: false, error: "serviceId is required" });
    }

    // Clamp paging so a crafted URL cannot request a negative skip (which
    // MongoDB rejects) or an unbounded page size on this public endpoint.
    const pageInt = Math.max(1, parseInt(page) || 1);
    const limitInt = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit) || DEFAULT_LIMIT));
    const filter = buildBrowseFilter(req.query);
    // The sold showcase is always ordered most-recently-sold first
    const isSoldList = sold === "true";
    const sortSpec = isSoldList ? { soldAt: -1, _id: -1 } : buildSort(sort);

    // The admin can cap how many sold items are ever exposed. Enforced here so
    // the cap holds across every page, not just the first one.
    let soldCap = 0;
    if (isSoldList) {
      const service = await serviceCollection.findOne(
        { _id: new ObjectId(serviceId) },
        { projection: { soldTotalLimit: 1 } }
      );
      soldCap = service?.soldTotalLimit > 0 ? service.soldTotalLimit : 0;
    }

    const skip = (pageInt - 1) * limitInt;
    // Never read past the cap
    const effectiveLimit = soldCap
      ? Math.max(0, Math.min(limitInt, soldCap - skip))
      : limitInt;

    if (effectiveLimit === 0) {
      const capped = soldCap
        ? Math.min(soldCap, await serviceItemCollection.countDocuments(filter))
        : 0;
      return res.send({ items: [], totalItems: capped });
    }

    const [items, totalItems] = await Promise.all([
      serviceItemCollection
        .find(filter, {
          sort: sortSpec,
          skip,
          limit: effectiveLimit,
          projection: {
            serviceId: 1,
            itemNumber: 1,
            images: 1,
            title: 1,
            stats: 1,
            shortDescription: 1,
            originalPrice: 1,
            offerPrice: 1,
            swiperDelay: 1,
            serial: 1,
          },
        })
        .toArray(),
      serviceItemCollection.countDocuments(filter),
    ]);

    // Report the capped total so the client renders the right number of pages
    res.send({
      items,
      totalItems: soldCap ? Math.min(soldCap, totalItems) : totalItems,
    });
  } catch (err) {
    console.error("getServiceItems: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// GET /serviceItems/get?id=
const getServiceItem = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send({ success: false, error: "id is required" });
    }
    // Allow-list, not a blacklist: `feedback` holds the delivered credentials,
    // so anything not explicitly listed here stays server-side by default.
    const item = await serviceItemCollection.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          serviceId: 1,
          itemNumber: 1,
          images: 1,
          title: 1,
          stats: 1,
          shortDescription: 1,
          description: 1,
          videoUrl: 1,
          originalPrice: 1,
          offerPrice: 1,
          swiperDelay: 1,
          coin: 1,
          serial: 1,
          isActive: 1,
          isSold: 1,
          whatsappNumber: 1,
          whatsappText: 1,
          telegramLink: 1,
          facebookLink: 1,
        },
      }
    );
    if (!item || item.isActive === false) {
      return res.status(404).send({ success: false, error: "Item not found" });
    }
    res.send(item);
  } catch (err) {
    console.error("getServiceItem: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// GET /serviceItems/filters?serviceId=
// Returns min/max bounds per stat and for price, to seed the filter UI.
const getFilterBounds = async (req, res) => {
  try {
    const { serviceId } = req.query;
    if (!serviceId) {
      return res
        .status(400)
        .send({ success: false, error: "serviceId is required" });
    }

    const result = await serviceItemCollection
      .aggregate([
        {
          $match: {
            serviceId: new ObjectId(serviceId),
            isActive: { $ne: false },
            isSold: { $ne: true },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            stat1Min: { $min: { $arrayElemAt: ["$stats", 0] } },
            stat1Max: { $max: { $arrayElemAt: ["$stats", 0] } },
            stat2Min: { $min: { $arrayElemAt: ["$stats", 1] } },
            stat2Max: { $max: { $arrayElemAt: ["$stats", 1] } },
            stat3Min: { $min: { $arrayElemAt: ["$stats", 2] } },
            stat3Max: { $max: { $arrayElemAt: ["$stats", 2] } },
            stat4Min: { $min: { $arrayElemAt: ["$stats", 3] } },
            stat4Max: { $max: { $arrayElemAt: ["$stats", 3] } },
            priceMin: { $min: "$offerPrice" },
            priceMax: { $max: "$offerPrice" },
          },
        },
      ])
      .toArray();

    if (!result.length) {
      // No items yet — return a zeroed shape so the UI can disable the filter panel
      return res.send({
        count: 0,
        stats: [],
        price: { min: 0, max: 0 },
      });
    }

    const b = result[0];
    res.send({
      count: b.count,
      stats: [
        { min: b.stat1Min ?? 0, max: b.stat1Max ?? 0 },
        { min: b.stat2Min ?? 0, max: b.stat2Max ?? 0 },
        { min: b.stat3Min ?? 0, max: b.stat3Max ?? 0 },
        { min: b.stat4Min ?? 0, max: b.stat4Max ?? 0 },
      ],
      price: { min: b.priceMin ?? 0, max: b.priceMax ?? 0 },
    });
  } catch (err) {
    console.error("getFilterBounds: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// GET /serviceItems/admin/all?serviceId=  (admin — includes inactive and sold)
const getAdminServiceItems = async (req, res) => {
  try {
    const { serviceId } = req.query;
    if (!serviceId) {
      return res
        .status(400)
        .send({ success: false, error: "serviceId is required" });
    }
    const items = await serviceItemCollection
      .find({ serviceId: new ObjectId(serviceId) }, { sort: { serial: -1, _id: -1 } })
      .toArray();
    res.send(items);
  } catch (err) {
    console.error("getAdminServiceItems: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// GET /serviceItems/admin/get?id=  (admin — full document including feedback)
const getAdminServiceItem = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send({ success: false, error: "id is required" });
    }
    const item = await serviceItemCollection.findOne({ _id: new ObjectId(id) });
    if (!item) {
      return res.status(404).send({ success: false, error: "Item not found" });
    }
    res.send(item);
  } catch (err) {
    console.error("getAdminServiceItem: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// POST /serviceItems/new  (admin)
const addServiceItem = async (req, res) => {
  try {
    const {
      serviceId,
      images,
      title,
      stats,
      shortDescription,
      description,
      videoUrl,
      originalPrice,
      offerPrice,
      swiperDelay,
      coin,
      feedback,
      serial,
      isActive,
      whatsappNumber,
      whatsappText,
      telegramLink,
      facebookLink,
    } = req.body;

    if (!serviceId || !title || !Array.isArray(images) || images.length === 0) {
      return res.status(400).send({
        success: false,
        error: "serviceId, title and at least one image are required",
      });
    }

    const service = await serviceCollection.findOne({
      _id: new ObjectId(serviceId),
    });
    if (!service) {
      return res
        .status(400)
        .send({ success: false, error: "Service not found" });
    }
    if (service.serviceType !== "itemListing") {
      return res.status(400).send({
        success: false,
        error: "Items can only be added to an Item Listing type service",
      });
    }

    const normalizedStats = normalizeStats(stats);
    if (!normalizedStats) {
      return res.status(400).send({
        success: false,
        error: `stats must be an array of ${STAT_COUNT} numbers`,
      });
    }

    const originalPriceNum = parseFloat(originalPrice);
    if (isNaN(originalPriceNum) || originalPriceNum < 0) {
      return res
        .status(400)
        .send({ success: false, error: "Invalid original price" });
    }
    // offerPrice is the effective price — falls back to originalPrice when blank
    let offerPriceNum = parseFloat(offerPrice);
    if (isNaN(offerPriceNum) || offerPriceNum < 0) {
      offerPriceNum = originalPriceNum;
    }

    const total = await serviceItemCollection.countDocuments({
      serviceId: new ObjectId(serviceId),
    });

    const item = {
      serviceId: new ObjectId(serviceId),
      itemNumber: await getNextItemNumber(),
      images,
      title,
      stats: normalizedStats,
      originalPrice: originalPriceNum,
      offerPrice: offerPriceNum,
      swiperDelay: parseInt(swiperDelay) > 0 ? parseInt(swiperDelay) : DEFAULT_SWIPER_DELAY,
      coin: parseInt(coin) > 0 ? parseInt(coin) : 0,
      serial: parseInt(serial) >= 0 ? parseInt(serial) : total + 1,
      isActive: toBool(isActive),
      isSold: false,
      createdAt: new Date(),
    };

    if (shortDescription) item.shortDescription = shortDescription;
    if (description) item.description = description;
    if (videoUrl) item.videoUrl = videoUrl;
    if (feedback) item.feedback = feedback;

    const cleanWhatsapp = sanitizeWhatsappNumber(whatsappNumber);
    if (cleanWhatsapp) item.whatsappNumber = cleanWhatsapp;
    if (whatsappText) item.whatsappText = whatsappText;
    if (telegramLink) item.telegramLink = telegramLink;
    if (facebookLink) item.facebookLink = facebookLink;

    const result = await serviceItemCollection.insertOne(item);
    res.send(result);
  } catch (err) {
    console.error("addServiceItem: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// PATCH /serviceItems/update  (admin)
const updateServiceItem = async (req, res) => {
  try {
    const {
      id,
      images,
      title,
      stats,
      shortDescription,
      description,
      videoUrl,
      originalPrice,
      offerPrice,
      swiperDelay,
      coin,
      feedback,
      serial,
      isActive,
      whatsappNumber,
      whatsappText,
      telegramLink,
      facebookLink,
    } = req.body;

    if (!id) {
      return res.status(400).send({ success: false, error: "id is required" });
    }

    const existing = await serviceItemCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!existing) {
      return res.status(404).send({ success: false, error: "Item not found" });
    }

    const updateDoc = { $set: {} };

    if (Array.isArray(images) && images.length > 0) {
      updateDoc.$set.images = images;
    }
    if (title) {
      updateDoc.$set.title = title;
    }
    if (stats !== undefined) {
      const normalizedStats = normalizeStats(stats);
      if (!normalizedStats) {
        return res.status(400).send({
          success: false,
          error: `stats must be an array of ${STAT_COUNT} numbers`,
        });
      }
      updateDoc.$set.stats = normalizedStats;
    }

    // Both prices are recomputed together so editing only one of them still
    // produces a consistent pair (a blank offerPrice falls back to originalPrice).
    if (originalPrice !== undefined || offerPrice !== undefined) {
      const originalPriceNum =
        originalPrice !== undefined && originalPrice !== ""
          ? parseFloat(originalPrice)
          : existing.originalPrice;
      if (isNaN(originalPriceNum) || originalPriceNum < 0) {
        return res
          .status(400)
          .send({ success: false, error: "Invalid original price" });
      }
      let offerPriceNum =
        offerPrice !== undefined && offerPrice !== ""
          ? parseFloat(offerPrice)
          : originalPriceNum;
      if (isNaN(offerPriceNum) || offerPriceNum < 0) {
        offerPriceNum = originalPriceNum;
      }
      updateDoc.$set.originalPrice = originalPriceNum;
      updateDoc.$set.offerPrice = offerPriceNum;
    }

    if (swiperDelay !== undefined) {
      updateDoc.$set.swiperDelay =
        parseInt(swiperDelay) > 0 ? parseInt(swiperDelay) : DEFAULT_SWIPER_DELAY;
    }
    if (coin !== undefined) {
      updateDoc.$set.coin = parseInt(coin) > 0 ? parseInt(coin) : 0;
    }
    if (serial !== undefined) {
      updateDoc.$set.serial = parseInt(serial) >= 0 ? parseInt(serial) : 0;
    }
    if (isActive !== undefined) {
      updateDoc.$set.isActive = toBool(isActive);
    }

    // The number is stored digits-only; an empty/undialable value clears it
    if (whatsappNumber !== undefined) {
      const cleanWhatsapp = sanitizeWhatsappNumber(whatsappNumber);
      if (cleanWhatsapp) {
        updateDoc.$set.whatsappNumber = cleanWhatsapp;
      } else {
        if (!updateDoc.$unset) updateDoc.$unset = {};
        updateDoc.$unset.whatsappNumber = 1;
      }
    }

    // Optional text fields — empty string clears the field
    const optionalText = {
      shortDescription,
      description,
      videoUrl,
      feedback,
      whatsappText,
      telegramLink,
      facebookLink,
    };
    Object.entries(optionalText).forEach(([key, val]) => {
      if (val === undefined) return;
      if (val === "" || val === null) {
        if (!updateDoc.$unset) updateDoc.$unset = {};
        updateDoc.$unset[key] = 1;
      } else {
        updateDoc.$set[key] = val;
      }
    });

    const result = await serviceItemCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );
    res.send(result);
  } catch (err) {
    console.error("updateServiceItem: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// PATCH /serviceItems/toggleActive  (admin)
const toggleServiceItemActive = async (req, res) => {
  try {
    const { id, isActive } = req.body;
    if (!id) {
      return res.status(400).send({ success: false, error: "id is required" });
    }
    const result = await serviceItemCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: toBool(isActive) } }
    );
    res.send(result);
  } catch (err) {
    console.error("toggleServiceItemActive: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// DELETE /serviceItems/delete?id=  (admin)
const deleteServiceItem = async (req, res) => {
  try {
    const { id } = req.query || {};
    if (!id) {
      return res.status(400).send({ success: false, error: "id is required" });
    }
    const result = await serviceItemCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (err) {
    console.error("deleteServiceItem: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getServiceItems,
  getServiceItem,
  getFilterBounds,
  getAdminServiceItems,
  getAdminServiceItem,
  addServiceItem,
  updateServiceItem,
  toggleServiceItemActive,
  deleteServiceItem,
};
