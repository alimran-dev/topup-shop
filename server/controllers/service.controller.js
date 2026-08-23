const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const {
  CENTRAL_SERVERS,
  getActiveSubscriberTiers,
  getUnitPricesByServer,
  getUnitNormalPricesByServer,
  augmentOptionsForSubscriber,
} = require("../utils/subscriberPricing");

const serviceCollection = dbCollections.serviceCollection;
const serviceItemCollection = dbCollections.serviceItemCollection;

// Helper: validate statLabels for an "itemListing" type service.
// Returns an error string when invalid, or null when valid.
const validateStatLabels = (statLabels) => {
  if (
    !Array.isArray(statLabels) ||
    statLabels.length !== 4 ||
    statLabels.some((l) => typeof l !== "string" || !l.trim())
  ) {
    return "An Item Listing service requires exactly 4 non-empty stat labels";
  }
  return null;
};

// Helper: stat labels become keys of an order's `info` object, so strip the
// characters that make MongoDB field names awkward to query ("." and leading "$")
const sanitizeStatLabels = (statLabels) =>
  statLabels.map((l) => l.trim().replace(/\./g, " ").replace(/^\$+/, ""));

// Helper: coerce an admin-entered count into a sane positive integer.
// Returns `fallback` when blank/invalid, and clamps to `max`.
const toCount = (value, fallback, max) => {
  if (value === undefined || value === null || value === "") return fallback;
  const n = parseInt(value);
  if (isNaN(n) || n < 0) return fallback;
  return max ? Math.min(n, max) : n;
};

const MAX_PER_PAGE = 100;

// Helper: Recursively collect all descendant service IDs for cascade delete
const getAllDescendantIds = async (parentId) => {
  const ids = [];
  const children = await serviceCollection
    .find({ parentServiceId: new ObjectId(parentId) })
    .project({ _id: 1 })
    .toArray();

  for (const child of children) {
    ids.push(child._id);
    const grandChildIds = await getAllDescendantIds(child._id);
    ids.push(...grandChildIds);
  }
  return ids;
};

// Helper: Walk up the parent chain from a service to check if targetId is an ancestor
const isAncestorOf = async (serviceId, targetId) => {
  let current = await serviceCollection.findOne(
    { _id: new ObjectId(serviceId) },
    { projection: { parentServiceId: 1 } }
  );
  while (current && current.parentServiceId) {
    if (current.parentServiceId.toString() === targetId.toString()) {
      return true;
    }
    current = await serviceCollection.findOne(
      { _id: new ObjectId(current.parentServiceId) },
      { projection: { parentServiceId: 1 } }
    );
  }
  return false;
};

// Helper: Decode redirectUrl in a service document for API response
const decodeRedirectUrl = (doc) => {
  if (doc && doc.redirectUrl) {
    try {
      doc.redirectUrl = decodeURI(doc.redirectUrl);
    } catch {
      // keep as-is if not encoded
    }
  }
  return doc;
};

// GET /services/get?id=
const getService = async (req, res) => {
  try {
    const { id } = req.query;
    // Sort options by serial
    await serviceCollection.updateOne(
      { _id: new ObjectId(id) },
      [
        {
          $addFields: {
            options: {
              $sortArray: {
                input: "$options",
                sortBy: { serial: 1 },
              },
            },
          },
        },
      ]
    );

    // Use aggregation to include childCount
    const result = await serviceCollection
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "services",
            localField: "_id",
            foreignField: "parentServiceId",
            as: "children",
          },
        },
        {
          $addFields: {
            childCount: { $size: "$children" },
          },
        },
        {
          $project: {
            parentServiceId: 1,
            categoryId: 1,
            title: 1,
            image: 1,
            tutorialText: 1,
            tutorialURL: 1,
            isAuto: 1,
            server: 1,
            serial: 1,
            isActive: 1,
            inputs: 1,
            rules: 1,
            options: 1,
            createdAt: 1,
            childCount: 1,
            notice: 1,
            description: 1,
            redirectUrl: 1,
            serviceType: 1,
            statLabels: 1,
            itemsPerPage: 1,
            soldPerPage: 1,
            soldTotalLimit: 1,
          },
        },
      ])
      .toArray();

    if (result.length > 0) {
      const service = decodeRedirectUrl(result[0]);

      // Subscriber pricing: logged-in non-admin users with an active
      // subscription see effective prices (admins and guests keep normal).
      if (req.user?.email && req.user?.role !== "admin") {
        const activeTiers = await getActiveSubscriberTiers(req.user.email);
        if (activeTiers.length > 0 && service.options?.length) {
          // Auto services resolve combos from central unit prices (mix rule:
          // priced units apply, unpriced units keep their normal unit price).
          // unipinNormal combos reuse the unipin unit prices.
          let unitPrices = null;
          let unitNormals = null;
          if (service.isAuto) {
            [unitPrices, unitNormals] = await Promise.all([
              getUnitPricesByServer(service.server),
              getUnitNormalPricesByServer(service.server),
            ]);
          }
          service.options = await augmentOptionsForSubscriber(
            service.options,
            service.server,
            activeTiers,
            unitPrices,
            unitNormals
          );
        } else if (service.options?.length) {
          // Non-admin user without an active subscription: hide raw maps
          service.options.forEach((opt) => delete opt.subscriberPrices);
        }
      } else if (service.options?.length && req.user?.role !== "admin") {
        // Guest: hide raw maps (admins keep them for form prefill)
        service.options.forEach((opt) => delete opt.subscriberPrices);
      }

      res.send(service);
    } else {
      res.status(404).send({ success: false, error: "Service not found" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// GET /services?activeOnly=true
const getAllServices = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === "true") {
      filter.isActive = { $ne: false };
      // Only return top-level services (no parentServiceId) for home page
      filter.parentServiceId = { $exists: false };
    }
    const result = await serviceCollection
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "services",
            let: { parentId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$parentServiceId", "$$parentId"] } } },
              ...(activeOnly === "true" ? [{ $match: { isActive: { $ne: false } } }] : []),
            ],
            as: "lookupChildren",
          },
        },
        {
          $addFields: {
            childCount: { $size: "$lookupChildren" },
          },
        },
        {
          $project: {
            categoryId: 1,
            title: 1,
            image: 1,
            serial: 1,
            isAuto: 1,
            server: 1,
            isActive: 1,
            childCount: 1,
            parentServiceId: 1,
            redirectUrl: 1,
            serviceType: 1,
          },
        },
        { $sort: { serial: 1 } },
      ])
      .toArray();
    res.send(result.map(decodeRedirectUrl));
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// GET /services/children?parentId=
const getChildServices = async (req, res) => {
  try {
    const { parentId } = req.query;
    if (!parentId) {
      return res
        .status(400)
        .send({ success: false, error: "parentId is required" });
    }
    const result = await serviceCollection
      .aggregate([
        { $match: { parentServiceId: new ObjectId(parentId), isActive: { $ne: false } } },
        {
          $lookup: {
            from: "services",
            let: { parentId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$parentServiceId", "$$parentId"] } } },
              { $match: { isActive: { $ne: false } } },
            ],
            as: "activeChildren",
          },
        },
        {
          $addFields: {
            childCount: { $size: "$activeChildren" },
          },
        },
        {
          $project: {
            categoryId: 1,
            title: 1,
            image: 1,
            serial: 1,
            isAuto: 1,
            server: 1,
            isActive: 1,
            childCount: 1,
            parentServiceId: 1,
            redirectUrl: 1,
            serviceType: 1,
          },
        },
        { $sort: { serial: 1 } },
      ])
      .toArray();
    res.send(result.map(decodeRedirectUrl));
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// GET /services/has-children?id=
const checkHasChildren = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .send({ success: false, error: "id is required" });
    }
    const count = await serviceCollection.countDocuments({
      parentServiceId: new ObjectId(id),
    });
    res.send({ hasChildren: count > 0, count });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// POST /services/new
const addSubCategory = async (req, res) => {
  try {
    const {
      title,
      categoryId,
      parentServiceId,
      image,
      tutorialText,
      tutorialURL,
      isAuto,
      server,
      inputs,
      rules,
      notice,
      description,
      redirectUrl,
      serviceType,
      statLabels,
    } = req.body;
    if (
      title &&
      categoryId &&
      image &&
      tutorialText &&
      tutorialURL &&
      inputs &&
      rules
    ) {
      // Validate item-listing configuration if that type is selected
      if (serviceType === "itemListing") {
        const statLabelError = validateStatLabels(statLabels);
        if (statLabelError) {
          return res
            .status(400)
            .send({ success: false, error: statLabelError });
        }
      }
      // Validate parentServiceId if provided
      if (parentServiceId) {
        const parentService = await serviceCollection.findOne({
          _id: new ObjectId(parentServiceId),
        });
        if (!parentService) {
          return res
            .status(400)
            .send({ success: false, error: "Parent service not found" });
        }
        // Validate category matches parent's category
        if (parentService.categoryId.toString() !== categoryId) {
          return res.status(400).send({
            success: false,
            error: "Child service must belong to the same category as its parent",
          });
        }
      }

      const total = await serviceCollection.countDocuments();
      const subCategory = {
        title,
        categoryId: new ObjectId(categoryId),
        image,
        tutorialText,
        tutorialURL,
        isAuto,
        serial: total + 1,
        isActive: true,
        inputs,
        rules,
        options: [],
        createdAt: new Date(),
      };
      if (parentServiceId) {
        subCategory.parentServiceId = new ObjectId(parentServiceId);
      }
      if (isAuto) {
        subCategory.server = server || "default";
      }
      if (notice) {
        subCategory.notice = notice;
      }
      if (description) {
        subCategory.description = description;
      }
      if (redirectUrl) {
        subCategory.redirectUrl = encodeURI(redirectUrl);
      }
      if (serviceType === "itemListing") {
        subCategory.serviceType = "itemListing";
        subCategory.statLabels = sanitizeStatLabels(statLabels);
        subCategory.itemsPerPage = toCount(
          req.body.itemsPerPage,
          20,
          MAX_PER_PAGE
        );
        subCategory.soldPerPage = toCount(
          req.body.soldPerPage,
          20,
          MAX_PER_PAGE
        );
        // 0 = show every sold item
        subCategory.soldTotalLimit = toCount(req.body.soldTotalLimit, 0);
      }
      const result = await serviceCollection.insertOne(subCategory);
      res.send(result);
    } else {
      console.log(
        title,
        categoryId,
        image,
        tutorialText,
        tutorialURL,
        inputs,
        rules
      );
      res.status(400).send({ success: false, message: "Invalid request" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// PATCH /services/update
const updateSubCategory = async (req, res) => {
  try {
    const {
      id,
      title,
      categoryId,
      parentServiceId,
      image,
      tutorialText,
      tutorialURL,
      inputs,
      serial,
      rules,
      isActive,
      notice,
      description,
      redirectUrl,
      serviceType,
      statLabels,
    } = req.body;
    const newSubCategory = { $set: {} };

    if (title) {
      newSubCategory.$set.title = title;
    }
    if (categoryId) {
      newSubCategory.$set.categoryId = new ObjectId(categoryId);
    }
    if (image) {
      newSubCategory.$set.image = image;
    }
    if (tutorialText) {
      newSubCategory.$set.tutorialText = tutorialText;
    }
    if (tutorialURL) {
      newSubCategory.$set.tutorialURL = tutorialURL;
    }
    if (inputs) {
      newSubCategory.$set.inputs = inputs;
    }
    if (rules) {
      newSubCategory.$set.rules = rules;
    }
    if (isActive !== undefined) {
      newSubCategory.$set.isActive = isActive;
    }
    if (notice !== undefined && notice !== "" && notice !== null) {
      newSubCategory.$set.notice = notice;
    }
    if (description !== undefined && description !== "" && description !== null) {
      newSubCategory.$set.description = description;
    }
    if (redirectUrl !== undefined && redirectUrl !== "" && redirectUrl !== null) {
      newSubCategory.$set.redirectUrl = encodeURI(redirectUrl);
    }

    newSubCategory.$set.serial = serial || 0;

    // Prepare the full update document
    const updateDoc = { $set: newSubCategory.$set };

    // Handle clearing of optional fields
    if (notice === "" || notice === null) {
      if (!updateDoc.$unset) updateDoc.$unset = {};
      updateDoc.$unset.notice = 1;
    }
    if (description === "" || description === null) {
      if (!updateDoc.$unset) updateDoc.$unset = {};
      updateDoc.$unset.description = 1;
    }
    if (redirectUrl === "" || redirectUrl === null) {
      if (!updateDoc.$unset) updateDoc.$unset = {};
      updateDoc.$unset.redirectUrl = 1;
    }

    // Handle serviceType / statLabels (item listing configuration)
    if (serviceType !== undefined) {
      if (serviceType === "itemListing") {
        const statLabelError = validateStatLabels(statLabels);
        if (statLabelError) {
          return res
            .status(400)
            .send({ success: false, error: statLabelError });
        }
        updateDoc.$set.serviceType = "itemListing";
        updateDoc.$set.statLabels = sanitizeStatLabels(statLabels);
        updateDoc.$set.itemsPerPage = toCount(
          req.body.itemsPerPage,
          20,
          MAX_PER_PAGE
        );
        updateDoc.$set.soldPerPage = toCount(
          req.body.soldPerPage,
          20,
          MAX_PER_PAGE
        );
        updateDoc.$set.soldTotalLimit = toCount(req.body.soldTotalLimit, 0);
      } else {
        // Reverting to a standard service — drop the listing configuration.
        // Existing items are kept in the DB but become unreachable via navigation.
        if (!updateDoc.$unset) updateDoc.$unset = {};
        updateDoc.$unset.serviceType = 1;
        updateDoc.$unset.statLabels = 1;
        updateDoc.$unset.itemsPerPage = 1;
        updateDoc.$unset.soldPerPage = 1;
        updateDoc.$unset.soldTotalLimit = 1;
      }
    }

    // Handle parentServiceId changes
    if (parentServiceId !== undefined) {
      const currentService = await serviceCollection.findOne({
        _id: new ObjectId(id),
      });

      const currentParentId = currentService?.parentServiceId?.toString() || "";
      const isRemovingParent =
        parentServiceId === null || parentServiceId === "";
      const isChangingToNewParent =
        parentServiceId !== null &&
        parentServiceId !== "" &&
        parentServiceId !== currentParentId;

      if (isRemovingParent && currentParentId) {
        // Remove parent field from document
        updateDoc.$unset = { parentServiceId: 1 };
      } else if (isChangingToNewParent) {
        // Validate and set new parent
        if (parentServiceId === id) {
          return res.status(400).send({
            success: false,
            error: "A service cannot be its own parent",
          });
        }
        const parentService = await serviceCollection.findOne({
          _id: new ObjectId(parentServiceId),
        });
        if (!parentService) {
          return res
            .status(400)
            .send({ success: false, error: "Parent service not found" });
        }
        const isCircular = await isAncestorOf(parentServiceId, id);
        if (isCircular) {
          return res.status(400).send({
            success: false,
            error:
              "Circular reference detected: cannot set a descendant as parent",
          });
        }
        const targetCategoryId = categoryId
          ? new ObjectId(categoryId)
          : currentService.categoryId;
        if (
          parentService.categoryId.toString() !== targetCategoryId.toString()
        ) {
          return res.status(400).send({
            success: false,
            error:
              "Child service must belong to the same category as its parent",
          });
        }
        updateDoc.$set.parentServiceId = new ObjectId(parentServiceId);
      }
    }

    const result = await serviceCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// DELETE /services/delete?id=
const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.query || {};
    if (!id) {
      return res
        .status(400)
        .send({ success: false, error: "id is required" });
    }

    // Collect all descendant IDs recursively
    const descendantIds = await getAllDescendantIds(id);

    // Delete listing items belonging to this service and all of its descendants,
    // otherwise they would be orphaned but still reachable by direct ID.
    const deletedItems = await serviceItemCollection.deleteMany({
      serviceId: { $in: [new ObjectId(id), ...descendantIds] },
    });

    // Delete all descendants first
    if (descendantIds.length > 0) {
      await serviceCollection.deleteMany({
        _id: { $in: descendantIds },
      });
    }

    // Delete the service itself
    const result = await serviceCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send({
      ...result,
      deletedDescendants: descendantIds.length,
      deletedItems: deletedItems.deletedCount || 0,
    });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getAllServices,
  addSubCategory,
  getService,
  updateSubCategory,
  deleteSubCategory,
  getChildServices,
  checkHasChildren,
};