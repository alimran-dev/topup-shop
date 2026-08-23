const { dbCollections } = require("../config/db");
const { computeEffectiveStatus } = require("./subscriptionStatus");

const subscriptionCollection = dbCollections.subscriptionCollection;
const subscriptionTypeCollection = dbCollections.subscriptionTypeCollection;
const subscriberPriceCollection = dbCollections.subscriberPriceCollection;
const serviceCollection = dbCollections.serviceCollection;

// Theme colors for subscription types (per-type site theming).
// Types store optional hex colors; missing fields fall back to the brand.
const THEME_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_THEME = { primaryColor: "#FA6023", secondaryColor: "#E61C55" };

// Auto servers whose combo-unit subscriber prices are set on the central
// admin page. Every combo item on these servers is priced as
// sum(unit price x row quantity). unipinNormal combos reuse the unipin unit
// prices (their rows are unipin units).
const CENTRAL_SERVERS = ["unipin", "my", "sg", "indo"];

// Active subscriptions of a user → [{ typeId (string), typeName }].
// "Active" is the effective status: suspended/cancelled/expired do NOT count.
// StartedAt-asc keeps the order stable when two tiers tie on price.
const getActiveSubscriberTiers = async (email) => {
  if (!email) return [];
  const now = new Date();
  const subs = await subscriptionCollection.find({ email }).toArray();
  return subs
    .filter((sub) => computeEffectiveStatus(sub, now) === "active")
    .map((sub) => ({
      typeId: sub.typeId?.toString ? sub.typeId.toString() : String(sub.typeId),
      typeName: sub.typeName,
      // Kept so the sort below is not a no-op: when two tiers tie on price,
      // the first in this order wins the price badge.
      startedAt: sub.startedAt,
    }))
    .sort((a, b) => a.startedAt - b.startedAt);
};

// Highest-priority ACTIVE tier of a user → { typeId (string), typeName,
// serial } or null when the user has no effective-active subscription.
// Priority = subscriptionTypes.serial (max wins; admin-controlled order).
// Types are re-read from the DB, so a deleted type silently drops out (its
// subscribers then resolve to the "normal" audience). Tie-break: older
// createdAt, then lower _id. NOTE: order must NOT rely on
// getActiveSubscriberTiers' internal sort — it drops startedAt, so its order
// is natural; this helper derives priority solely from the type sort.
const getHighestActiveTier = async (email) => {
  const activeTiers = await getActiveSubscriberTiers(email);
  if (!activeTiers?.length) return null;
  const activeIds = new Set(activeTiers.map((t) => t.typeId));
  const types = await subscriptionTypeCollection
    .find({})
    .sort({ serial: -1, createdAt: 1, _id: 1 })
    .toArray();
  const top = types.find((t) => activeIds.has(t._id.toString()));
  if (!top) return null;
  return {
    typeId: top._id.toString(),
    typeName: top.name,
    serial: top.serial,
    primaryColor: top.primaryColor || DEFAULT_THEME.primaryColor,
    secondaryColor: top.secondaryColor || DEFAULT_THEME.secondaryColor,
  };
};

// Theme for the user's highest-priority effective-active tier, or null when
// the user has no valid subscription. Suspended/cancelled/expired subs do NOT
// count (same semantics as pricing and ads).
const getSubscriptionTheme = async (email) => {
  const tier = await getHighestActiveTier(email);
  if (!tier) return null;
  return {
    typeName: tier.typeName,
    primaryColor: tier.primaryColor,
    secondaryColor: tier.secondaryColor,
  };
};

// Lowest price among the user's active tiers for the given prices map.
// pricesMap = { [typeIdString]: number }. Returns { price, tierName } or null
// when no active tier has a numeric price.
const resolveSubscriberPrice = (pricesMap, activeTiers) => {
  if (!pricesMap || !activeTiers?.length) return null;
  let best = null;
  for (const tier of activeTiers) {
    const p = pricesMap[tier.typeId];
    if (typeof p === "number" && isFinite(p) && p >= 0) {
      if (!best || p < best.price) best = { price: p, tierName: tier.typeName };
    }
  }
  return best;
};

// Central unit prices that apply to options on this server: central servers
// read their own docs; unipinNormal combos reuse the unipin unit prices.
const getUnitPricesByServer = async (server) => {
  const source = server === "unipinNormal" ? "unipin" : server;
  const docs = await subscriberPriceCollection.find({ server: source }).toArray();
  const map = new Map();
  for (const doc of docs) map.set(doc.unitKey, doc);
  return map;
};

// Normal per-unit price, derived from the unit's own standalone option on the
// same server (an option whose combo has exactly ONE active row), e.g.
// "25 Diamond " (combo [25 Diamond x1], price 19) → 25 Diamond = 19.
// Used by the mix rule: when a combo row has no subscriber price, the row
// keeps its normal unit price so a partially-priced combo still reflects the
// priced units. An option named exactly like the unit is authoritative;
// otherwise the first occurrence in serial order wins.
const getUnitNormalPricesByServer = async (server) => {
  const services = await serviceCollection
    .find({ isAuto: true, server, isActive: { $ne: false } })
    .project({ title: 1, serial: 1, options: 1 })
    .toArray();
  const normals = new Map(); // unitKey → normal unit price
  for (const service of services.sort(
    (a, b) => (a.serial ?? 0) - (b.serial ?? 0)
  )) {
    for (const option of service.options || []) {
      const rows = (option.combo || []).filter(
        (r) => r.quantity && r.quantity > 0
      );
      if (rows.length !== 1) continue; // standalone unit options only
      const key = String(
        rows[0].name ?? rows[0].uc ?? rows[0].package ?? ""
      ).trim();
      if (!key) continue;
      const price = option.price / rows[0].quantity;
      if (!isFinite(price) || price < 0) continue;
      if (!normals.has(key) || String(option.name || "").trim() === key) {
        normals.set(key, price);
      }
    }
  }
  return normals;
};

// Subscriber price of ONE option for the user's active tiers:
// 1. a manual per-option subscriberPrices map wins whenever present
//    (non-central servers set these in the option forms);
// 2. otherwise, combos price from the central unit prices: a priced unit
//    uses its subscriber price, an unpriced unit keeps its normal unit
//    price, so pricing one unit immediately flows into every combo that
//    uses it. If no row is priced, or a row has neither a subscriber price
//    nor a derivable normal price, the whole option falls back to its
//    normal price (never a partial sum, never above the normal price).
const computeOptionSubscriberPrice = async (
  option,
  server,
  activeTiers,
  unitPricesByKey,
  unitNormalsByKey
) => {
  if (!activeTiers?.length) return null;
  const manual = resolveSubscriberPrice(option.subscriberPrices, activeTiers);
  if (manual) return manual;

  const rows = (option.combo || []).filter(
    (r) => r.quantity && r.quantity > 0
  );
  if (!rows.length) return null;

  let total = 0;
  let winner = null;
  for (const row of rows) {
    // Unit identity is the row NAME — the only field present in every combo
    // row shape ({name,quantity} unipin, {label,name,quantity} indo,
    // {dollar,name,quantity} sg, {name,package,quantity} my). uc/package are
    // used only as fallbacks for rows that carry them.
    const key = String(row.name ?? row.uc ?? row.package ?? "").trim();
    const resolved = resolveSubscriberPrice(
      unitPricesByKey?.get(key)?.prices,
      activeTiers
    );
    if (resolved) {
      total += resolved.price * row.quantity;
      if (!winner) winner = resolved;
    } else if (unitNormalsByKey?.has(key)) {
      total += unitNormalsByKey.get(key) * row.quantity;
    } else {
      return null; // unpriced unit with no derivable normal → normal price
    }
  }
  if (!winner) return null; // nothing priced → keep the option's normal price
  const cap = typeof option.price === "number" ? option.price : Infinity;
  return { price: Math.min(total, cap), tierName: winner.tierName };
};

// Catalog augmentation: for each option with a resolved subscriber price,
// expose the effective price alongside the normal one + winning tier name.
// Options without a price keep their original shape (price = normal).
const augmentOptionsForSubscriber = async (
  options,
  server,
  activeTiers,
  unitPricesByKey,
  unitNormalsByKey
) => {
  if (!Array.isArray(options) || !activeTiers?.length) return options;
  const result = [];
  for (const opt of options) {
    const resolved = await computeOptionSubscriberPrice(
      opt,
      server,
      activeTiers,
      unitPricesByKey,
      unitNormalsByKey
    );
    if (resolved) {
      result.push({
        ...opt,
        regularPrice: opt.price,
        price: resolved.price,
        subscriberTier: resolved.tierName,
      });
    } else {
      result.push(opt);
    }
  }
  return result;
};

module.exports = {
  CENTRAL_SERVERS,
  THEME_COLOR_RE,
  DEFAULT_THEME,
  getActiveSubscriberTiers,
  getHighestActiveTier,
  getSubscriptionTheme,
  resolveSubscriberPrice,
  getUnitPricesByServer,
  getUnitNormalPricesByServer,
  computeOptionSubscriberPrice,
  augmentOptionsForSubscriber,
};
