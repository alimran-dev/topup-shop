// Effective subscription status is derived on every read (no cron, no
// scheduled writes): a "suspended" sub past its expiry still reports
// suspended — the admin action is the more recent fact; resuming it will
// then immediately read as expired. Shared between the subscription
// controller and the subscriber-pricing helpers.
const computeEffectiveStatus = (sub, now = new Date()) => {
  if (sub.status === "cancelled") return "cancelled";
  if (sub.status === "suspended") return "suspended";
  if (sub.expiresAt <= now) return "expired";
  return "active";
};

module.exports = { computeEffectiveStatus };
