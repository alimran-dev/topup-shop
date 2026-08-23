const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { getHighestActiveTier } = require("../utils/subscriberPricing");

const adsCollection = dbCollections.adsCollection;
const subscriptionTypeCollection = dbCollections.subscriptionTypeCollection;

// Sentinel role for everyone without an active subscription: guests, plain
// logged-in users, and admins.
const NORMAL_ROLE = "normal";

// Roles are the ad's audience: "normal" and/or subscription type _ids.
// Validation: non-empty array, trimmed, unique; each entry is either
// NORMAL_ROLE or an EXISTING type id. Existence only, no isActive filter — a
// deactivated type still has effective-active subscribers, so its ad must
// keep matching them.
const validateRoles = async (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return { ok: false, message: "Select at least one role for the ad" };
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

// One-ad-per-role guard: any OTHER ad covering one of the submitted roles.
const findConflict = (roles, ownId = null) =>
  adsCollection.findOne({
    roles: { $in: roles },
    ...(ownId ? { _id: { $ne: new ObjectId(ownId) } } : {}),
  });

// Personalized ad for the viewer: logged-in non-admins with an active
// subscription get the ad of their highest-priority tier; everyone else gets
// the "normal" ad. A role with no ad assigned → empty body (the client shows
// no modal — no fallback of any kind).
const getAds = async (req, res) => {
  try {
    const user = req.user;
    let role = NORMAL_ROLE;
    if (user && user.role !== "admin") {
      const top = await getHighestActiveTier(user.email);
      if (top) role = top.typeId;
    }
    const ad = await adsCollection.findOne({ roles: role });
    res.send(ad);
  } catch (err) {
    console.error("getAds: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// Admin list — ALL ads (legacy role-less docs included, so the admin can see
// and delete them).
const getAdminAds = async (req, res) => {
  try {
    const ads = await adsCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.send(ads);
  } catch (err) {
    console.error("getAdminAds: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addAds = async (req, res) => {
  try {
    const { imageUrl, path, roles } = req.body || {};
    if (!imageUrl || !String(imageUrl).trim()) {
      return res
        .status(400)
        .send({ success: false, message: "Ad image is required" });
    }
    if (!path || !String(path).trim()) {
      return res
        .status(400)
        .send({ success: false, message: "Redirect path is required" });
    }
    const validated = await validateRoles(roles);
    if (!validated.ok) {
      return res.status(400).send({ success: false, message: validated.message });
    }
    const conflict = await findConflict(validated.roles);
    if (conflict) {
      return res.status(409).send({
        success: false,
        message: "One or more selected roles already have an ad",
      });
    }
    const now = new Date();
    const result = await adsCollection.insertOne({
      imageUrl: String(imageUrl).trim(),
      path: String(path).trim(),
      roles: validated.roles,
      createdAt: now,
      updatedAt: now,
    });
    res.send(result);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "One or more selected roles already have an ad",
      });
    }
    console.error("addAds: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateAds = async (req, res) => {
  try {
    const { id, imageUrl, path, roles } = req.body || {};
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ad id" });
    }
    if (!imageUrl || !String(imageUrl).trim()) {
      return res
        .status(400)
        .send({ success: false, message: "Ad image is required" });
    }
    if (!path || !String(path).trim()) {
      return res
        .status(400)
        .send({ success: false, message: "Redirect path is required" });
    }
    const validated = await validateRoles(roles);
    if (!validated.ok) {
      return res.status(400).send({ success: false, message: validated.message });
    }
    const existing = await adsCollection.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return res.status(404).send({ success: false, message: "Ad not found" });
    }
    const conflict = await findConflict(validated.roles, id);
    if (conflict) {
      return res.status(409).send({
        success: false,
        message: "One or more selected roles already have an ad",
      });
    }
    const result = await adsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          imageUrl: String(imageUrl).trim(),
          path: String(path).trim(),
          roles: validated.roles,
          updatedAt: new Date(),
        },
      }
    );
    res.send(result);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "One or more selected roles already have an ad",
      });
    }
    console.error("updateAds: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteAds = async (req, res) => {
  try {
    const { id } = req.query || {};
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: "Invalid ad id" });
    }
    const result = await adsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    console.error("deleteAds: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getAds, getAdminAds, addAds, updateAds, deleteAds };
