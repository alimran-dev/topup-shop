const { dbCollections } = require("../config/db");
const { coinSettingCollection, coinHistoryCollection, userCollection } =
  dbCollections || {};

const getDailyCoinNumber = async (req, res) => {
  try {
    const { email } = req.user || {};
    if (!email) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.send({ success: false, message: "User not found" });
    }
    const duration =
      (new Date().getTime() - new Date(user.coinLastClaim).getTime()) /
      (1000 * 60 * 60);
    if (user.coinLastClaim && duration <= 24) {
      return res.send({
        success: false,
        message: "You already claimed today.",
      });
    }
    const coinSettings = await coinSettingCollection.findOne({
      type: "settings",
    });
    if (!coinSettings) {
      return res.send({
        success: false,
        message: "Coin setting did not found",
      });
    }
    res.send({ success: true, daily: coinSettings?.daily });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getCoinSettings = async (req, res) => {
  try {
    const result = await coinSettingCollection.findOne({ type: "settings" });
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};
const claimDailyCoin = async (req, res) => {
  try {
    const { email } = req.body || {};
    const { email: emailInCookie } = req.user || {};
    if (email !== emailInCookie) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid Request" });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.send({ success: false, message: "User not found" });
    }
    const duration =
      (new Date().getTime() - new Date(user.coinLastClaim).getTime()) /
      (1000 * 60 * 60);
    if (user.coinLastClaim && duration <= 24) {
      return res.send({
        success: false,
        message: "You already claimed today.",
      });
    }
    const coinSettings = await coinSettingCollection.findOne({
      type: "settings",
    });
    if (!coinSettings) {
      return res.send({ success: false, message: "Coin Settings not found" });
    }
    const userUpdate = await userCollection.updateOne(
      { email: email },
      {
        $set: {
          coins: user.coins + coinSettings.daily,
          coinLastClaim: new Date(),
        },
      }
    );
    if (userUpdate.modifiedCount) {
      const coinHistory = {
        email: email,
        name: "Daily Claim",
        status: "success",
        amount: coinSettings.daily,
        createdAt: new Date(),
      };
      const result = await coinHistoryCollection.insertOne(coinHistory);
      if (result.insertedId) {
        return res.send({
          success: true,
          amount: coinSettings.daily,
          message: `Claimed ${coinSettings.daily} coins`,
        });
      }
    }
    res.send({ success: false, message: "Something went wrong" });
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

const getReviewAmount=async(req,res)=>{
  try{
    const coinSettings=await coinSettingCollection.findOne({type: "settings"});
    if(!coinSettings){
      return res.send({success: false, message: "Coin Settings does not exists"});
    }
    res.send({success: true, perReview: coinSettings.perReview});
  }catch(err){
    console.error("getReviewAmount: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
}
const claimReviewAmount=async(req,res)=>{
  try{

  }catch(err){
    console.error("claimReviewAmount: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
}
const changeReviewStatus=async(req,res)=>{
  try{

  }catch(err){
    console.error("changeReviewStatus: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
}

module.exports = {
  getDailyCoinNumber,
  getCoinSettings,
  claimDailyCoin,
  updateCoinSetting,
};
