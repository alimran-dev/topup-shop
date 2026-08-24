const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const {
  getActiveSubscriberTiers,
  DEFAULT_THEME,
} = require("../utils/subscriberPricing");

const { specialOfferCollection } = dbCollections || {};
const subscriptionTypeCollection = dbCollections?.subscriptionTypeCollection;

// Sentinel role for everyone without an active subscription: guests, plain
// logged-in users, and admins (same convention as the ads roles).
const NORMAL_ROLE = "normal";

const hasValue = (v) =>
  v !== undefined && v !== null && String(v).trim() !== "";

// allowedRoles validation — mirrors ads.controller.js: non-empty entries,
// unique, each "normal" or an EXISTING type id (existence only, no isActive
// filter — a deactivated type still has effective-active subscribers).
// Optional: absent/empty → everyone can buy.
const validateRoles = async (roles) => {
  if (roles === undefined || roles === null) return { ok: true, roles: [] };
  if (!Array.isArray(roles)) {
    return { ok: false, message: "allowedRoles must be an array" };
  }
  const cleaned = [];
  const seen = new Set();
  for (const raw of roles) {
    const role = String(raw ?? "").trim();
    if (!role) return { ok: false, message: "Roles must be non-empty strings" };
    if (seen.has(role)) {
      return { ok: false, message: "Duplicate role in selection" };
    }
    seen.add(role);
    cleaned.push(role);
  }
  const typeIds = cleaned.filter((r) => r !== NORMAL_ROLE);
  if (typeIds.length) {
    const invalid = typeIds.find((id) => !ObjectId.isValid(id));
    if (invalid) return { ok: false, message: "Unknown role in selection" };
    const found = await subscriptionTypeCollection
      .find({ _id: { $in: typeIds.map((id) => new ObjectId(id)) } })
      .project({ _id: 1 })
      .toArray();
    if (found.length !== typeIds.length) {
      return {
        ok: false,
        message: "One or more subscription types no longer exist",
      };
    }
  }
  return { ok: true, roles: cleaned };
};

// highlightTypeId validation: must be an EXISTING type id; when the offer is
// restricted to types (allowedRoles has type ids), it must be one of them.
// Optional: blank/absent → no highlight.
const validateHighlightTypeId = async (highlightTypeId, allowedRoles) => {
  if (!hasValue(highlightTypeId)) return { ok: true, id: "" };
  const id = String(highlightTypeId).trim();
  if (!ObjectId.isValid(id)) {
    return { ok: false, message: "Invalid highlight type" };
  }
  const type = await subscriptionTypeCollection.findOne(
    { _id: new ObjectId(id) },
    { projection: { _id: 1 } }
  );
  if (!type) {
    return {
      ok: false,
      message: "Highlight subscription type no longer exists",
    };
  }
  const typeRoles = allowedRoles.filter((r) => r !== NORMAL_ROLE);
  if (typeRoles.length && !typeRoles.includes(id)) {
    return {
      ok: false,
      message: "Highlight type must be one of the allowed types",
    };
  }
  return { ok: true, id };
};

// Viewer audience for canPurchase: active subscriber type ids, else
// ["normal"] (guests, plain users, admins).
const getAudience = async (user) => {
  if (!user || user.role === "admin") return [NORMAL_ROLE];
  const tiers = await getActiveSubscriberTiers(user.email);
  if (!tiers?.length) return [NORMAL_ROLE];
  return tiers.map((t) => t.typeId);
};

// Attach canPurchase + highlightColors to ONE offer. Highlight colors are
// resolved at READ TIME from highlightTypeId (per-field brand fallback), so
// later edits to a type's colors reflect immediately.
const resolveOfferView = async (offer, audience) => {
  const enriched = { ...offer };
  const roles = offer?.allowedRoles;
  enriched.canPurchase =
    !roles?.length || roles.some((r) => audience.includes(r));
  if (offer?.highlightTypeId && ObjectId.isValid(offer.highlightTypeId)) {
    const type = await subscriptionTypeCollection.findOne(
      { _id: new ObjectId(offer.highlightTypeId) },
      { projection: { name: 1, primaryColor: 1, secondaryColor: 1 } }
    );
    if (type) {
      enriched.highlightColors = {
        typeName: type.name,
        primaryColor: type.primaryColor || DEFAULT_THEME.primaryColor,
        secondaryColor: type.secondaryColor || DEFAULT_THEME.secondaryColor,
      };
    }
  }
  return enriched;
};

const getSpecialOffer = async (req, res) => {
  try {
    const { id } = req.query || {};
    const result = await specialOfferCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { claimedBy: 0 } }
    );
    if (!result) return res.send(result);
    const audience = await getAudience(req.user);
    res.send(await resolveOfferView(result, audience));
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllSpecialOffer = async (req, res) => {
  try {
    const offers = await specialOfferCollection
      .find({isActive: true}, {sort: {sequence: 1}})
      .project({ claimedBy: 0 })
      .toArray();
    const audience = await getAudience(req.user);
    // Batch-fetch the highlight types once (distinct highlightTypeIds) —
    // avoid a query per offer.
    const highlightIds = [
      ...new Set(
        offers
          .map((o) => o.highlightTypeId)
          .filter((id) => id && ObjectId.isValid(id))
      ),
    ];
    const typeMap = new Map();
    if (highlightIds.length) {
      const types = await subscriptionTypeCollection
        .find({ _id: { $in: highlightIds.map((id) => new ObjectId(id)) } })
        .project({ name: 1, primaryColor: 1, secondaryColor: 1 })
        .toArray();
      for (const t of types) typeMap.set(t._id.toString(), t);
    }
    const result = offers.map((offer) => {
      const enriched = { ...offer };
      const roles = offer?.allowedRoles;
      enriched.canPurchase =
        !roles?.length || roles.some((r) => audience.includes(r));
      const type = typeMap.get(offer?.highlightTypeId);
      if (type) {
        enriched.highlightColors = {
          typeName: type.name,
          primaryColor: type.primaryColor || DEFAULT_THEME.primaryColor,
          secondaryColor: type.secondaryColor || DEFAULT_THEME.secondaryColor,
        };
      }
      return enriched;
    });
    res.send(result);
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllSpecialOfferAdmin = async (req, res) => {
  try {
    const result = await specialOfferCollection
      .find({},{sort: {sequence: 1}})
      .project({ claimedBy: 0 })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addSpecialOffer = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      image,
      type,
      price,
      stock,
      tutorialTitle,
      tutorialUrl,
      inputs,
      maxClaim,
      maxClaimPerInput,
      willHaveQuantity,
      isAuto,
      autoServer,
      combo,
      allowedRoles,
      highlightTypeId
    } = req.body || {};
    const priceInt = parseInt(price);
    const stockInt = parseInt(stock);
    const maxClaimInt = parseInt(maxClaim);
    const maxClaimPerInputInt = parseInt(maxClaimPerInput);
    if (
      !title ||
      !shortDescription ||
      !image ||
      !type ||
      !tutorialTitle ||
      !tutorialUrl ||
      inputs.length == 0
    ) {
      return res.status(400).send({ message: "Invalid Request" });
    } else if ((isNaN(priceInt) || priceInt < 0) || (isNaN(stockInt) || stockInt < 0)) {
      return res.status(400).send({ message: "Invalid price or stock" });
    } else if (type !== "balance" && type !== "coin") {
      return res.status(400).send({ message: "Invalid balance type" });
    } else if (hasValue(maxClaim) && (isNaN(maxClaimInt) || maxClaimInt < 0)) {
      return res.status(400).send({ message: "Invalid max claim" });
    } else if (hasValue(maxClaimPerInput) && (isNaN(maxClaimPerInputInt) || maxClaimPerInputInt < 0)) {
      return res.status(400).send({ message: "Invalid max claim per input" });
    }
    const validatedRoles = await validateRoles(allowedRoles);
    if (!validatedRoles.ok) {
      return res.status(400).send({ message: validatedRoles.message });
    }
    const validatedHighlight = await validateHighlightTypeId(
      highlightTypeId,
      validatedRoles.roles
    );
    if (!validatedHighlight.ok) {
      return res.status(400).send({ message: validatedHighlight.message });
    }
    const totalOffers=await specialOfferCollection.countDocuments();
    const newOffer = {
      type,
      isActive: true,
      title,
      image,
      shortDescription,
      price: priceInt,
      stock: stockInt,
      sequence: totalOffers+1,
      tutorialTitle,
      tutorialUrl,
      inputs,
      isAuto: isAuto || false,
      willHaveQuantity: willHaveQuantity || false,
      createdAt: new Date(),
      claimedBy: [],
    };
    // Optional caps: blank/absent ⇒ unlimited (field simply not stored)
    if (hasValue(maxClaim)) {
      newOffer.maxClaim = maxClaimInt;
    }
    if (hasValue(maxClaimPerInput)) {
      newOffer.maxClaimPerInput = maxClaimPerInputInt;
    }
    // Optional subscriber restriction + highlight: absent ⇒ everyone / no highlight
    if (validatedRoles.roles.length) {
      newOffer.allowedRoles = validatedRoles.roles;
    }
    if (validatedHighlight.id) {
      newOffer.highlightTypeId = validatedHighlight.id;
    }
    if(isAuto){
      newOffer.autoServer = autoServer || "";
      newOffer.combo = combo || [];
    }
    const result = await specialOfferCollection.insertOne(newOffer);
    res.send({ ...result, ...newOffer });
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateSpecialOffer = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      image,
      type,
      price,
      stock,
      sequence,
      isActive,
      tutorialTitle,
      tutorialUrl,
      inputs,
      maxClaim,
      maxClaimPerInput,
      willHaveQuantity,
      isAuto,
      autoServer,
      combo,
      allowedRoles,
      highlightTypeId
    } = req.body || {};
    const { id } = req.query || {};
    const priceInt = parseInt(price);
    const stockInt = parseInt(stock);
    const sequenceInt=parseInt(sequence);
    const maxClaimInt = parseInt(maxClaim);
    const maxClaimPerInputInt = parseInt(maxClaimPerInput);
    if (
      !id ||
      !title ||
      !shortDescription ||
      !type ||
      !tutorialTitle ||
      !tutorialUrl ||
      isNaN(sequenceInt) ||
      inputs.length == 0
    ) {
      return res.status(400).send({ message: "Invalid Request" });
    } else if ((isNaN(priceInt) || priceInt < 0) || (isNaN(stockInt) || stockInt < 0)) {
      return res.status(400).send({ message: "Invalid price or stock" });
    } else if (type !== "balance" && type !== "coin") {
      return res.status(400).send({ message: "Invalid balance type" });
    } else if (hasValue(maxClaim) && (isNaN(maxClaimInt) || maxClaimInt < 0)) {
      return res.status(400).send({ message: "Invalid max claim" });
    } else if (hasValue(maxClaimPerInput) && (isNaN(maxClaimPerInputInt) || maxClaimPerInputInt < 0)) {
      return res.status(400).send({ message: "Invalid max claim per input" });
    }
    const validatedRoles = await validateRoles(allowedRoles);
    if (!validatedRoles.ok) {
      return res.status(400).send({ message: validatedRoles.message });
    }
    const validatedHighlight = await validateHighlightTypeId(
      highlightTypeId,
      validatedRoles.roles
    );
    if (!validatedHighlight.ok) {
      return res.status(400).send({ message: validatedHighlight.message });
    }
    const updatedOffer = {
      type,
      isActive,
      title,
      shortDescription,
      price: priceInt,
      stock: stockInt,
      sequence: sequenceInt,
      tutorialTitle,
      tutorialUrl,
      inputs,
      isAuto: isAuto || false,
      willHaveQuantity: willHaveQuantity || false,
    };
    // Optional fields: non-blank ⇒ $set; blank/absent ⇒ $unset so the offer
    // returns to unlimited / everyone / no highlight.
    const unsetFields = {};
    if (hasValue(maxClaim)) {
      updatedOffer.maxClaim = maxClaimInt;
    } else {
      unsetFields.maxClaim = "";
    }
    if (hasValue(maxClaimPerInput)) {
      updatedOffer.maxClaimPerInput = maxClaimPerInputInt;
    } else {
      unsetFields.maxClaimPerInput = "";
    }
    if (validatedRoles.roles.length) {
      updatedOffer.allowedRoles = validatedRoles.roles;
    } else {
      unsetFields.allowedRoles = "";
    }
    if (validatedHighlight.id) {
      updatedOffer.highlightTypeId = validatedHighlight.id;
    } else {
      unsetFields.highlightTypeId = "";
    }
    if(isAuto){
      updatedOffer.autoServer = autoServer || "";
      updatedOffer.combo = combo || [];
    }
    if(image){
      updatedOffer.image=image;
    }
    const result = await specialOfferCollection.updateOne(
      { _id: new ObjectId(id) },
      {$set: updatedOffer, ...(Object.keys(unsetFields).length ? {$unset: unsetFields} : {})}
    );
    res.send(result);
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteSpecialOffer = async (req, res) => {
  try {
    const { id } = req.query || {};
    if (!id) {
      return res.status(400).send({ message: "id query required" });
    }
    const result = await specialOfferCollection.deleteOne({_id: new ObjectId(id)});
    res.send(result);
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getSpecialOffer,
  getAllSpecialOffer,
  getAllSpecialOfferAdmin,
  addSpecialOffer,
  updateSpecialOffer,
  deleteSpecialOffer,
};
