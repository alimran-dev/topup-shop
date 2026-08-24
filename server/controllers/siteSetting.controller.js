const { dbCollections } = require("../config/db");

const siteSettingCollection = dbCollections.siteSettingCollection;

// Home "Last Orders" tile settings. Defaults keep the old behavior: price
// shown. The doc is created on first PATCH (upsert), so a fresh DB needs no
// seed step — readers fall back to the defaults below.
const DEFAULT_SETTINGS = { lastOrderShowPrice: true };

const findSettings = async () => {
  const doc = await siteSettingCollection.findOne({ type: "settings" });
  if (doc) return doc;
  return { type: "settings", ...DEFAULT_SETTINGS };
};

const getSiteSettings = async (req, res) => {
  try {
    res.send(await findSettings());
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateSiteSettings = async (req, res) => {
  try {
    const { lastOrderShowPrice } = req.body || {};
    const update = {};
    if (typeof lastOrderShowPrice === "boolean") {
      update.lastOrderShowPrice = lastOrderShowPrice;
    }
    if (!Object.keys(update).length) {
      return res
        .status(400)
        .send({ success: false, message: "No valid settings provided" });
    }
    const result = await siteSettingCollection.updateOne(
      { type: "settings" },
      { $set: update, $setOnInsert: { type: "settings" } },
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getSiteSettings, updateSiteSettings };
