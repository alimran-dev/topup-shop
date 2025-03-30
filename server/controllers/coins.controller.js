const { dbCollections } = require("../config/db");
const { coinSettingCollection, coinHistoryCollection } = dbCollections || {};

const getDailyCoinNumber = async (req, res) => {
  try {
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getCoinSettings = async (req, res) => {
  try {
    const result=await coinSettingCollection.findOne({type: "settings"});
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};
const claimDailyCoin = async (req, res) => {
  try {
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateCoinSetting = async (req, res) => {
  try {
    const {
      referFrom,
      referTo,
      firstLevelAmount,
      firstLevelCoin,
      secondLevelAmount,
      secondLevelCoin,
      thirdLevelCoin,
      daily,
      perReview,
    } = req.body || {};
    const setting = {
      type: "settings",
      referFrom: parseInt(referFrom),
      referTo: parseInt(referTo),
      firstLevelAmount: parseInt(firstLevelAmount),
      firstLevelCoin: parseFloat(firstLevelCoin),
      secondLevelAmount: parseInt(secondLevelAmount),
      secondLevelCoin: parseInt(secondLevelCoin),
      thirdLevelCoin: parseFloat(thirdLevelCoin),
      daily: parseInt(daily),
      perReview: parseInt(perReview),
      createdAt: new Date(),
    };
    const result = await coinSettingCollection.updateOne(
      { type: "settings" },
      { $set: setting },
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getDailyCoinNumber,
  getCoinSettings,
  claimDailyCoin,
  updateCoinSetting,
};
