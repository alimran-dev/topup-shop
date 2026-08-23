const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { CENTRAL_SERVERS } = require("../utils/subscriberPricing");

const serviceCollection = dbCollections.serviceCollection;
const subscriptionTypeCollection = dbCollections.subscriptionTypeCollection;
const subscriberPriceCollection = dbCollections.subscriberPriceCollection;

// Combo rows map to a unit key per server. The row NAME is the unit identity
// — it is the only field present in every row shape ({name,quantity} unipin,
// {label,name,quantity} indo, {dollar,name,quantity} sg,
// {name,package,quantity} my). uc/package are fallbacks only, so one saved
// price applies to every service/option whose combo uses that unit.
const unitKeyOf = (row) => String(row.name ?? row.uc ?? row.package ?? "").trim();

// The unit list per central server is EXACTLY the option-add combo modal's
// list (AddDynamicOption.jsx comboConfigs) — same entries, same order, same
// names; nothing more, nothing less (user, 2026-08-23: "list will be same as
// there no more or less also naming will be same as modal"). Each entry is
// [modal name, unitKey] where unitKey is the modal's `original` — the REAL
// combo-row name that subscriber prices attach to ("25 💎" → "25 Diamond",
// "LU Pass - 6" → "Level Up Package - Level 6", "Weekly" → "Weekly Lite" on
// my / "Weekly Membership" on unipin). Saved price docs whose unitKey is not
// in these lists are not shown (their prices still apply to any combo that
// uses the row name).
const COMBO_UNIT_LISTS = {
  unipin: [
    ["25 💎", "25 Diamond"],
    ["50 💎", "50 Diamond"],
    ["115 💎", "115 Diamond"],
    ["240 💎", "240 Diamond"],
    ["610 💎", "610 Diamond"],
    ["1240 💎", "1240 Diamond"],
    ["2530 💎", "2530 Diamond"],
    ["Weekly", "Weekly Membership"],
    ["Monthly", "Monthly Membership"],
  ],
  my: [
    ["LU Pass - 6", "Level Up Package - Level 6"],
    ["LU Pass - 10", "Level Up Package - Level 10"],
    ["LU Pass - 15", "Level Up Package - Level 15"],
    ["LU Pass - 20", "Level Up Package - Level 20"],
    ["LU Pass - 25", "Level Up Package - Level 25"],
    ["LU Pass - 30", "Level Up Package - Level 30"],
    ["Evo 3D", "Evo Access 3D"],
    ["Evo 7D", "Evo Access 7D"],
    ["Evo 30D", "Evo Access 30D"],
    ["Weekly", "Weekly Lite"],
    ["Less is More", "Less is More"],
  ],
  indo: [
    ["5 💎", "5"],
    ["50 💎", "50"],
    ["70 💎", "70"],
    ["140 💎", "140"],
    ["355 💎", "355"],
    ["720 💎", "720"],
    ["7290 💎", "7.290"],
    ["36500 💎", "36.500"],
    ["73100 💎", "73.100"],
    ["BP Card", "BP Card"],
    ["Monthly", "Member Bulanan"],
    ["Weekly", "Member Mingguan"],
    ["LU Pass - 6", "Level Up Pass - Level 6"],
    ["LU Pass - 10", "Level Up Pass - Level 10"],
    ["LU Pass - 15", "Level Up Pass - Level 15"],
    ["LU Pass - 20", "Level Up Pass - Level 20"],
    ["LU Pass - 25", "Level Up Pass - Level 25"],
    ["LU Pass - 30", "Level Up Pass - Level 30"],
  ],
  sg: [["Weekly Lite", "Weekly Lite"]],
};

const getAdminPricing = async (req, res) => {
  try {
    const [types, services, savedDocs] = await Promise.all([
      subscriptionTypeCollection
        .find({ isActive: { $ne: false } })
        .sort({ serial: 1 })
        .project({ name: 1 })
        .toArray(),
      // isActive filter: disabled services (e.g. the closed airdrop) stop
      // contributing to the usedBy hints.
      serviceCollection
        .find({
          isAuto: true,
          server: { $in: CENTRAL_SERVERS },
          isActive: { $ne: false },
        })
        .project({ title: 1, server: 1, serial: 1, options: 1 })
        .toArray(),
      subscriberPriceCollection.find({}).toArray(),
    ]);

    // Live usage per unit (which active services' combos use it) — the unit
    // LIST itself comes from COMBO_UNIT_LISTS (the combo modal's list); this
    // scan only fills the usedBy hints.
    const usage = new Map(); // key: `${server}:${unitKey}` → Set of service titles
    for (const service of services) {
      for (const option of service.options || []) {
        const rows = (option.combo || []).filter(
          (r) => r.quantity && r.quantity > 0
        );
        for (const row of rows) {
          const unitKey = unitKeyOf(row);
          if (!unitKey) continue;
          const key = `${service.server}:${unitKey}`;
          if (!usage.has(key)) usage.set(key, new Set());
          usage.get(key).add(service.title);
        }
      }
    }

    const pricesByKey = new Map();
    for (const doc of savedDocs) {
      pricesByKey.set(`${doc.server}:${doc.unitKey}`, doc.prices || {});
    }

    // Exact combo-modal list per server, in modal order, with the modal's
    // names — nothing auto-collected, nothing dropped.
    const servers = CENTRAL_SERVERS.map((server) => ({
      server,
      units: (COMBO_UNIT_LISTS[server] || []).map(([name, unitKey]) => ({
        unitKey,
        name,
        usedBy: [...(usage.get(`${server}:${unitKey}`) || [])],
        prices: pricesByKey.get(`${server}:${unitKey}`) || {},
      })),
    }));

    res.send({ types, servers });
  } catch (err) {
    console.error("getAdminPricing: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const upsertSubscriberPrice = async (req, res) => {
  try {
    const { server, unitKey, name, prices } = req.body || {};
    if (!CENTRAL_SERVERS.includes(server)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid server" });
    }
    if (!unitKey || !String(unitKey).trim()) {
      return res
        .status(400)
        .send({ success: false, message: "Unit key is required" });
    }

    // Keep only numeric prices ≥ 0; null/empty values drop the key.
    const sanitized = {};
    for (const [typeId, value] of Object.entries(prices || {})) {
      if (value === null || value === undefined || value === "") continue;
      const num = Number(value);
      if (!isFinite(num) || num < 0) {
        return res.status(400).send({
          success: false,
          message: "Prices must be non-negative numbers",
        });
      }
      sanitized[typeId] = num;
    }

    const result = await subscriberPriceCollection.findOneAndUpdate(
      { server, unitKey: String(unitKey).trim() },
      {
        $set: {
          name: name ? String(name).trim() : String(unitKey).trim(),
          prices: sanitized,
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    const doc =
      result && Object.prototype.hasOwnProperty.call(result, "value")
        ? result.value
        : result;
    res.send(doc);
  } catch (err) {
    console.error("upsertSubscriberPrice: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getAdminPricing, upsertSubscriberPrice };
