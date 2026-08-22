const { ObjectId } = require("mongodb");
const { cookieOption } = require("../utils/cookieOption");
const { dbCollections } = require("../config/db");

const subscriptionTypeCollection = dbCollections.subscriptionTypeCollection;
const subscriptionPackageCollection = dbCollections.subscriptionPackageCollection;
const subscriptionCollection = dbCollections.subscriptionCollection;
const subscriptionHistoryCollection = dbCollections.subscriptionHistoryCollection;
const userCollection = dbCollections.userCollection;

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DAYS_IN_MONTH = 30;

// Months are normalized to 30 days so renewal math is always in days.
// The value is computed server-side; the client never supplies durationDays.
const durationToDays = (duration, unit) =>
  duration * (unit === "months" ? DAYS_IN_MONTH : 1);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Effective status is derived on every read (no cron, no scheduled writes):
// a "suspended" sub past its expiry still reports suspended — the admin action
// is the more recent fact; resuming it will then immediately read as expired.
const computeEffectiveStatus = (sub, now = new Date()) => {
  if (sub.status === "cancelled") return "cancelled";
  if (sub.status === "suspended") return "suspended";
  if (sub.expiresAt <= now) return "expired";
  return "active";
};

const daysRemaining = (sub, now = new Date()) =>
  sub.expiresAt ? Math.max(0, Math.ceil((sub.expiresAt - now) / MS_PER_DAY)) : 0;

// Driver 6 returns the document directly; guard for the metadata shape too.
const unwrapDoc = (res) =>
  res && Object.prototype.hasOwnProperty.call(res, "value") ? res.value : res;

const parsePageLimit = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  return { page, limit };
};

// ---------------------------------------------------------------------------
// Public catalog (#1)
// ---------------------------------------------------------------------------

const getCatalog = async (req, res) => {
  try {
    const [types, packages] = await Promise.all([
      subscriptionTypeCollection
        .find({ isActive: { $ne: false } })
        .sort({ serial: 1 })
        .toArray(),
      subscriptionPackageCollection
        .find({ isActive: { $ne: false } })
        .sort({ typeName: 1, createdAt: -1 })
        .toArray(),
    ]);
    res.send({ types, packages });
  } catch (err) {
    console.error("getCatalog: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// ---------------------------------------------------------------------------
// Admin: subscription types (#2-#5)
// ---------------------------------------------------------------------------

const getAdminTypes = async (req, res) => {
  try {
    const result = await subscriptionTypeCollection
      .find()
      .sort({ serial: 1 })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("getAdminTypes: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res
        .status(400)
        .send({ success: false, message: "Type name is required" });
    }
    const total = await subscriptionTypeCollection.countDocuments();
    const type = {
      name: String(name).trim(),
      serial: total + 1,
      isActive: true,
      createdAt: new Date(),
    };
    const result = await subscriptionTypeCollection.insertOne(type);
    res.send(result);
  } catch (err) {
    console.error("addType: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateType = async (req, res) => {
  try {
    const { id, name, serial, isActive } = req.body;
    if (!id) {
      return res
        .status(400)
        .send({ success: false, message: "Type ID is required" });
    }
    const updateFields = { $set: {} };
    if (name !== undefined) updateFields.$set.name = String(name).trim();
    if (serial !== undefined) updateFields.$set.serial = serial;
    if (isActive !== undefined) updateFields.$set.isActive = isActive;
    if (Object.keys(updateFields.$set).length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "Nothing to update" });
    }
    const result = await subscriptionTypeCollection.updateOne(
      { _id: new ObjectId(id) },
      updateFields
    );
    // Keep the denormalized name in sync everywhere it is shown live
    // (catalog cards, package table, MySubscription, subscribers list).
    // History events are immutable snapshots and intentionally keep the
    // name that was current when the event happened.
    if (updateFields.$set.name !== undefined) {
      await Promise.all([
        subscriptionPackageCollection.updateMany(
          { typeId: new ObjectId(id) },
          { $set: { typeName: updateFields.$set.name } }
        ),
        subscriptionCollection.updateMany(
          { typeId: new ObjectId(id) },
          { $set: { typeName: updateFields.$set.name } }
        ),
      ]);
    }
    res.send(result);
  } catch (err) {
    console.error("updateType: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteType = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .send({ success: false, message: "Type ID is required" });
    }
    const typeId = new ObjectId(id);
    const packageCount = await subscriptionPackageCollection.countDocuments({
      typeId,
    });
    if (packageCount > 0) {
      return res.status(400).send({
        success: false,
        message: "Cannot delete: subscription packages exist under this type",
      });
    }
    const result = await subscriptionTypeCollection.deleteOne({ _id: typeId });
    res.send({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("deleteType: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// ---------------------------------------------------------------------------
// Admin: subscription packages (#6-#10)
// ---------------------------------------------------------------------------

const getAdminPackages = async (req, res) => {
  try {
    const { typeId, search } = req.query;
    const filter = {};
    if (typeId) {
      filter.typeId = new ObjectId(typeId);
    }
    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }
    const result = await subscriptionPackageCollection
      .find(filter)
      .sort({ typeName: 1, createdAt: -1 })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("getAdminPackages: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAdminPackage = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .send({ success: false, message: "Package ID is required" });
    }
    const result = await subscriptionPackageCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!result) {
      return res
        .status(404)
        .send({ success: false, message: "Package not found" });
    }
    res.send(result);
  } catch (err) {
    console.error("getAdminPackage: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addPackage = async (req, res) => {
  try {
    const {
      typeId,
      name,
      duration,
      durationUnit,
      price,
      termsAndConditions,
      isActive,
    } = req.body;

    if (!typeId || !name || !String(name).trim()) {
      return res
        .status(400)
        .send({ success: false, message: "Type and package name are required" });
    }
    if (
      typeof duration !== "number" ||
      !isFinite(duration) ||
      duration <= 0 ||
      (durationUnit !== "days" && durationUnit !== "months")
    ) {
      return res.status(400).send({
        success: false,
        message: "Duration must be a positive number with unit days or months",
      });
    }
    if (typeof price !== "number" || !isFinite(price) || price < 0) {
      return res
        .status(400)
        .send({ success: false, message: "Price must be a valid number" });
    }

    const type = await subscriptionTypeCollection.findOne({
      _id: new ObjectId(typeId),
    });
    if (!type) {
      return res
        .status(400)
        .send({ success: false, message: "Subscription type not found" });
    }

    const now = new Date();
    const packageDoc = {
      typeId: new ObjectId(typeId),
      typeName: type.name,
      name: String(name).trim(),
      duration,
      durationUnit,
      durationDays: durationToDays(duration, durationUnit),
      price,
      termsAndConditions: termsAndConditions || "",
      isActive: isActive !== undefined ? isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    const result = await subscriptionPackageCollection.insertOne(packageDoc);
    res.send(result);
  } catch (err) {
    console.error("addPackage: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updatePackage = async (req, res) => {
  try {
    const {
      id,
      typeId,
      name,
      duration,
      durationUnit,
      price,
      termsAndConditions,
      isActive,
    } = req.body;
    if (!id) {
      return res
        .status(400)
        .send({ success: false, message: "Package ID is required" });
    }

    const updateFields = { $set: {}, $unset: {} };
    if (name !== undefined) updateFields.$set.name = String(name).trim();
    if (price !== undefined) {
      if (typeof price !== "number" || !isFinite(price) || price < 0) {
        return res
          .status(400)
          .send({ success: false, message: "Price must be a valid number" });
      }
      updateFields.$set.price = price;
    }
    if (termsAndConditions !== undefined)
      updateFields.$set.termsAndConditions = termsAndConditions;
    if (isActive !== undefined) updateFields.$set.isActive = isActive;

    // Recompute durationDays whenever duration or its unit changes.
    if (duration !== undefined || durationUnit !== undefined) {
      const existing = await subscriptionPackageCollection.findOne({
        _id: new ObjectId(id),
      });
      const nextDuration = duration !== undefined ? duration : existing.duration;
      const nextUnit =
        durationUnit !== undefined ? durationUnit : existing.durationUnit;
      if (
        typeof nextDuration !== "number" ||
        !isFinite(nextDuration) ||
        nextDuration <= 0 ||
        (nextUnit !== "days" && nextUnit !== "months")
      ) {
        return res.status(400).send({
          success: false,
          message: "Duration must be a positive number with unit days or months",
        });
      }
      updateFields.$set.duration = nextDuration;
      updateFields.$set.durationUnit = nextUnit;
      updateFields.$set.durationDays = durationToDays(nextDuration, nextUnit);
    }

    // Re-denormalize typeName when the package moves to another type.
    if (typeId !== undefined) {
      const type = await subscriptionTypeCollection.findOne({
        _id: new ObjectId(typeId),
      });
      if (!type) {
        return res
          .status(400)
          .send({ success: false, message: "Subscription type not found" });
      }
      updateFields.$set.typeId = new ObjectId(typeId);
      updateFields.$set.typeName = type.name;
    }

    updateFields.$set.updatedAt = new Date();
    const result = await subscriptionPackageCollection.updateOne(
      { _id: new ObjectId(id) },
      updateFields
    );
    res.send(result);
  } catch (err) {
    console.error("updatePackage: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deletePackage = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .send({ success: false, message: "Package ID is required" });
    }
    const packageId = new ObjectId(id);

    // Once a package has been purchased it must never disappear: history rows
    // and subscription docs reference it by name/snapshot. Soft-deactivate.
    const [subCount, historyCount] = await Promise.all([
      subscriptionCollection.countDocuments({ lastPackageId: packageId }),
      subscriptionHistoryCollection.countDocuments({ packageId }),
    ]);
    if (subCount > 0 || historyCount > 0) {
      await subscriptionPackageCollection.updateOne(
        { _id: packageId },
        { $set: { isActive: false, updatedAt: new Date() } }
      );
      return res.send({ success: true, softDeleted: true, message: "Package deactivated" });
    }

    const result = await subscriptionPackageCollection.deleteOne({
      _id: packageId,
    });
    res.send({ success: true, hardDeleted: result.deletedCount });
  } catch (err) {
    console.error("deletePackage: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// ---------------------------------------------------------------------------
// Purchase (#11)
// ---------------------------------------------------------------------------

const purchaseSubscription = async (req, res) => {
  try {
    const { packageId, email, agreed } = req.body || {};
    const emailInToken = req.user?.email;
    if (email !== emailInToken) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ message: "unauthorized" });
    }
    if (agreed !== true) {
      return res.status(400).send({
        success: false,
        message: "You must agree to the terms and conditions",
      });
    }
    if (!packageId) {
      return res
        .status(400)
        .send({ success: false, message: "Package ID is required" });
    }

    const pkg = await subscriptionPackageCollection.findOne({
      _id: new ObjectId(packageId),
    });
    if (!pkg || pkg.isActive === false) {
      return res
        .status(400)
        .send({ success: false, message: "Package is not available" });
    }
    const type = await subscriptionTypeCollection.findOne({ _id: pkg.typeId });
    if (!type || type.isActive === false) {
      return res.status(400).send({
        success: false,
        message: "This package is no longer available",
      });
    }
    if (typeof pkg.price !== "number" || !isFinite(pkg.price) || pkg.price < 0) {
      return res
        .status(400)
        .send({ success: false, message: "Package price is invalid" });
    }

    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(401).send({ error: "User Not Found" });
    }

    const now = new Date();
    const durationMs =
      (pkg.durationDays || durationToDays(pkg.duration, pkg.durationUnit)) *
      MS_PER_DAY;

    // Pre-read the current subscription: used for the extension display and,
    // on a failure after charging, for best-effort compensation.
    const prevSub = await subscriptionCollection.findOne({
      email,
      typeId: pkg.typeId,
    });

    // Atomic balance deduction: the `balance: { $gte: price }` guard makes the
    // affordability check and the deduction a single operation, so concurrent
    // purchases cannot overdraw the account (same pattern as orderItemListing).
    const userUpdate = await userCollection.updateOne(
      { email, balance: { $gte: pkg.price } },
      { $inc: { balance: -pkg.price, spent: pkg.price } }
    );
    if (!userUpdate.modifiedCount) {
      return res
        .status(400)
        .send({ success: false, error: "You don't have enough balance" });
    }

    // Snapshot of the exact T&C the user agreed to. Package edits never
    // rewrite historical agreements — this copy is the record.
    const agreement = {
      termsAndConditions: pkg.termsAndConditions || "",
      packageId: pkg._id,
      packageName: pkg.name,
      agreedAt: now,
    };

    let eventId;
    try {
      // Atomic upsert: one document per (email, typeId). The aggregation
      // pipeline implements the transition table — on upsert the pipeline only
      // sees the query fields, so every reference is guarded with $ifNull and
      // createdAt is set explicitly.
      const upsertRes = await subscriptionCollection.findOneAndUpdate(
        { email, typeId: pkg.typeId },
        [
          {
            $set: {
              status: {
                $cond: [
                  { $eq: [{ $ifNull: ["$status", "active"] }, "cancelled"] },
                  "active",
                  { $ifNull: ["$status", "active"] },
                ],
              },
              // fresh start only when there was no subscription or it was cancelled
              startedAt: {
                $cond: [
                  {
                    $or: [
                      { $eq: [{ $ifNull: ["$status", "active"] }, "cancelled"] },
                      { $eq: [{ $ifNull: ["$startedAt", null] }, null] },
                    ],
                  },
                  now,
                  "$startedAt",
                ],
              },
              // active/expired/suspended: extend from max(now, expiresAt)
              // cancelled/none: start from now
              expiresAt: {
                $add: [
                  {
                    $cond: [
                      { $eq: [{ $ifNull: ["$status", "active"] }, "cancelled"] },
                      now,
                      { $max: [{ $ifNull: ["$expiresAt", now] }, now] },
                    ],
                  },
                  durationMs,
                ],
              },
              typeName: pkg.typeName,
              lastPurchasedAt: now,
              lastPackageId: pkg._id,
              lastPackageName: pkg.name,
              lastPrice: pkg.price,
              agreement,
              createdAt: { $ifNull: ["$createdAt", now] },
              updatedAt: now,
            },
          },
        ],
        { upsert: true, returnDocument: "after" }
      );
      const updatedSub = unwrapDoc(upsertRes);

      const historyEvent = {
        eventType: "purchase",
        email,
        typeId: pkg.typeId,
        typeName: pkg.typeName,
        packageId: pkg._id,
        packageName: pkg.name,
        price: pkg.price,
        durationDays: pkg.durationDays,
        agreement,
        newExpiresAt: updatedSub.expiresAt,
        createdAt: now,
      };
      const historyResult =
        await subscriptionHistoryCollection.insertOne(historyEvent);
      eventId = historyResult.insertedId.toString();

      res.send({
        success: true,
        price: pkg.price,
        newExpiresAt: updatedSub.expiresAt,
        subscription: updatedSub,
        eventId,
      });
    } catch (innerErr) {
      // The customer has already been charged, so if the subscription or its
      // history cannot be persisted, undo the charge rather than leaving the
      // buyer with a deduction and no proof of purchase.
      console.error(
        "purchaseSubscription (persist failed, compensating): ",
        innerErr.message
      );
      await userCollection.updateOne(
        { email },
        { $inc: { balance: pkg.price, spent: -pkg.price } }
      );
      if (prevSub) {
        await subscriptionCollection.updateOne(
          { email, typeId: pkg.typeId },
          {
            $set: {
              status: prevSub.status,
              startedAt: prevSub.startedAt,
              expiresAt: prevSub.expiresAt,
              lastPurchasedAt: prevSub.lastPurchasedAt,
              lastPackageId: prevSub.lastPackageId,
              lastPackageName: prevSub.lastPackageName,
              lastPrice: prevSub.lastPrice,
              agreement: prevSub.agreement,
              typeName: prevSub.typeName,
              updatedAt: now,
            },
          }
        );
      } else {
        await subscriptionCollection.deleteOne({ email, typeId: pkg.typeId });
      }
      return res
        .status(500)
        .send({ success: false, error: "Internal Server Error" });
    }
  } catch (err) {
    console.error("purchaseSubscription: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// ---------------------------------------------------------------------------
// User: my subscriptions + history (#12, #13)
// ---------------------------------------------------------------------------

const getMySubscriptions = async (req, res) => {
  try {
    const email = req.user?.email;
    const now = new Date();
    const subs = await subscriptionCollection
      .find({ email })
      .sort({ createdAt: -1 })
      .toArray();
    const subscriptions = subs.map((sub) => ({
      ...sub,
      effectiveStatus: computeEffectiveStatus(sub, now),
      daysRemaining: daysRemaining(sub, now),
    }));
    res.send({ subscriptions });
  } catch (err) {
    console.error("getMySubscriptions: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getMySubscriptionHistory = async (req, res) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    const email = req.user?.email;
    const filter = { email };
    const totalItems =
      await subscriptionHistoryCollection.countDocuments(filter);
    const items = await subscriptionHistoryCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    res.send({ items, totalItems });
  } catch (err) {
    console.error("getMySubscriptionHistory: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// ---------------------------------------------------------------------------
// Admin: subscribers (#14)
// ---------------------------------------------------------------------------

const getAdminSubscribers = async (req, res) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    const { typeId, email, status } = req.query;
    const now = new Date();

    const filter = {};
    if (typeId) filter.typeId = new ObjectId(typeId);
    if (email) filter.email = { $regex: new RegExp(email, "i") };
    if (status) {
      if (status === "active") {
        filter.status = "active";
        filter.expiresAt = { $gt: now };
      } else if (status === "expired") {
        filter.status = "active";
        filter.expiresAt = { $lte: now };
      } else if (status === "suspended" || status === "cancelled") {
        filter.status = status;
      } else {
        return res
          .status(400)
          .send({ success: false, message: "Invalid status filter" });
      }
    }

    const totalItems = await subscriptionCollection.countDocuments(filter);
    // $lookup needs an aggregation pipeline; the plain skip/limit pattern
    // applies inside it.
    const rows = await subscriptionCollection
      .aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "email",
            foreignField: "email",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            email: 1,
            typeId: 1,
            typeName: 1,
            status: 1,
            startedAt: 1,
            expiresAt: 1,
            lastPurchasedAt: 1,
            lastPackageName: 1,
            lastPrice: 1,
            createdAt: 1,
            updatedAt: 1,
            user: { name: "$user.name", phone: "$user.phone", photo: "$user.photo" },
          },
        },
      ])
      .toArray();

    const items = rows.map((sub) => ({
      ...sub,
      effectiveStatus: computeEffectiveStatus(sub, now),
      daysRemaining: daysRemaining(sub, now),
    }));
    res.send({ items, totalItems });
  } catch (err) {
    console.error("getAdminSubscribers: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// ---------------------------------------------------------------------------
// Admin: suspend / resume / cancel (#15)
// ---------------------------------------------------------------------------

const adminAction = async (req, res) => {
  try {
    const { id, action, note } = req.body || {};
    if (!id) {
      return res
        .status(400)
        .send({ success: false, message: "Subscription ID is required" });
    }
    if (!["suspend", "resume", "cancel"].includes(action)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid action" });
    }

    const sub = await subscriptionCollection.findOne({ _id: new ObjectId(id) });
    if (!sub) {
      return res
        .status(404)
        .send({ success: false, message: "Subscription not found" });
    }

    const now = new Date();
    // Transition guards live in the query, not in a read-then-write: two
    // concurrent clicks can only succeed once, so no duplicate events.
    const guard =
      action === "suspend"
        ? { status: { $nin: ["suspended", "cancelled"] } } // active or silently expired
        : action === "resume"
        ? { status: "suspended" }
        : { status: { $ne: "cancelled" } }; // cancel: terminal, allowed from any non-cancelled state
    const update =
      action === "suspend"
        ? { $set: { status: "suspended", suspendedAt: now, updatedAt: now } }
        : action === "resume"
        ? { $set: { status: "active", suspendedAt: null, updatedAt: now } }
        : { $set: { status: "cancelled", cancelledAt: now, updatedAt: now } };

    const updateRes = await subscriptionCollection.findOneAndUpdate(
      { _id: new ObjectId(id), ...guard },
      update,
      { returnDocument: "after" }
    );
    const updatedSub = unwrapDoc(updateRes);
    if (!updatedSub) {
      // The sub exists (checked above) but the transition is invalid.
      const message =
        action === "suspend"
          ? "Subscription is already suspended or cancelled"
          : action === "resume"
          ? "Subscription is not suspended"
          : "Subscription is already cancelled";
      return res.status(400).send({ success: false, message });
    }

    // Every admin action is a dated log entry visible in both admin and user history.
    await subscriptionHistoryCollection.insertOne({
      eventType: action,
      email: sub.email,
      typeId: sub.typeId,
      typeName: sub.typeName,
      newExpiresAt: sub.expiresAt,
      adminEmail: req.user?.email,
      note: note || "",
      createdAt: now,
    });

    res.send({
      success: true,
      subscription: {
        ...updatedSub,
        effectiveStatus: computeEffectiveStatus(updatedSub, now),
      },
    });
  } catch (err) {
    console.error("adminAction: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

// ---------------------------------------------------------------------------
// Admin: history (#16)
// ---------------------------------------------------------------------------

const getAdminHistory = async (req, res) => {
  try {
    const { page, limit } = parsePageLimit(req.query);
    const { eventType, typeId, email, from, to } = req.query;

    const filter = {};
    if (eventType && ["purchase", "suspend", "resume", "cancel"].includes(eventType)) {
      filter.eventType = eventType;
    }
    if (typeId) filter.typeId = new ObjectId(typeId);
    if (email) filter.email = { $regex: new RegExp(email, "i") };
    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) filter.createdAt.$gte = fromDate;
      }
      if (to) {
        // inclusive: the whole of the "to" day
        const toDate = new Date(to);
        if (!isNaN(toDate))
          filter.createdAt.$lte = new Date(toDate.getTime() + 86399999);
      }
    }

    const totalItems = await subscriptionHistoryCollection.countDocuments(filter);
    const items = await subscriptionHistoryCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    res.send({ items, totalItems });
  } catch (err) {
    console.error("getAdminHistory: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getCatalog,
  getAdminTypes,
  addType,
  updateType,
  deleteType,
  getAdminPackages,
  getAdminPackage,
  addPackage,
  updatePackage,
  deletePackage,
  purchaseSubscription,
  getMySubscriptions,
  getMySubscriptionHistory,
  getAdminSubscribers,
  adminAction,
  getAdminHistory,
};
