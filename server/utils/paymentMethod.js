const { dbCollections } = require("../config/db");
const { getActiveSubscriberTiers } = require("./subscriberPricing");

const transactionCollection = dbCollections.transactionCollection;

// Audience sentinel for non-subscribers (mirrors the ads/special-offer gating).
const NORMAL_ROLE = "normal";

// Active subscriber type ids of a user, else ["normal"] (guest/plain/admin
// without an active sub). Same semantics as the special-offer eligibility.
const getAudience = async (email) => {
  const tiers = await getActiveSubscriberTiers(email);
  return tiers.length ? tiers.map((t) => t.typeId) : [NORMAL_ROLE];
};

// Daily-hours window: activeStartHour/activeEndHour are 0-23 integers or
// null/absent (= unbounded). start > end wraps across midnight
// (22:00 -> 06:00 is active overnight). start === end = full day.
const isWithinHours = (method, now = new Date()) => {
  const start = method?.activeStartHour;
  const end = method?.activeEndHour;
  if (start == null && end == null) return true;
  if (start == end) return true;
  const hour = now.getHours();
  if (start != null && end != null) {
    return start < end
      ? hour >= start && hour < end
      : hour >= start || hour < end;
  }
  if (start != null) return hour >= start;
  return hour < end;
};

// Total amount received via a payment method (completed transactions only).
// resetAt (receivedResetAt) shifts the baseline: received since the last
// admin reset; null = all-time.
const getReceivedAmount = async (methodId, resetAt) => {
  const filter = { methodID: methodId, status: "completed" };
  if (resetAt) filter.time = { $gte: new Date(resetAt) };
  const rows = await transactionCollection
    .aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
    .toArray();
  return rows[0]?.total || 0;
};

// Full availability gate used by BOTH the customer list (/payment/methods)
// and the purchase backstops (addBalance / bkashCreatePayment):
// 1. admin status must be "active";
// 2. allowedRoles absent/empty = everyone, else the viewer's audience must
//    include one of the roles (see-it model, server-enforced);
// 3. daily-hours window (blank = always);
// 4. receiving limit (blank/absent = unlimited; 0 is a real limit of 0).
//    Limit hit = auto-inactive — COMPUTED here, never written to the doc;
//    the admin's Reset button zeroes the baseline and it recovers instantly.
const isMethodAvailable = (method, audience, received) => {
  if (method?.status !== "active") return false;
  const roles = method?.allowedRoles;
  if (roles?.length && !roles.some((r) => audience.includes(r))) return false;
  if (!isWithinHours(method)) return false;
  const limit = method?.receivingLimit;
  if (limit != null && received >= limit) return false;
  return true;
};

module.exports = {
  NORMAL_ROLE,
  getAudience,
  isWithinHours,
  getReceivedAmount,
  isMethodAvailable,
};
