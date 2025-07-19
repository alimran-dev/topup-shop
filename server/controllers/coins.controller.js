const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const {
  coinSettingCollection,
  coinHistoryCollection,
  userCollection,
  coinProductsCollection,
} = dbCollections || {};

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
    const now = new Date();
    const coinLastClaimDate = new Date(user.coinLastClaim);
    if (
      now.getDate() === coinLastClaimDate.getDate() &&
      now.getMonth() === coinLastClaimDate.getMonth() &&
      now.getFullYear() === coinLastClaimDate.getFullYear()
    ) {
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
    if (!user.isVerified) {
      return res.send({ success: false, message: "Email is not verified" });
    }
    const now = new Date();
    const coinLastClaimDate = new Date(user.coinLastClaim);
    if (
      now.getDate() === coinLastClaimDate.getDate() &&
      now.getMonth() === coinLastClaimDate.getMonth() &&
      now.getFullYear() === coinLastClaimDate.getFullYear()
    ) {
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

const getReviewAmount = async (req, res) => {
  try {
    const coinSettings = await coinSettingCollection.findOne({
      type: "settings",
    });
    if (!coinSettings) {
      return res.send({
        success: false,
        message: "Coin Settings does not exists",
      });
    }
    res.send({ success: true, perReview: coinSettings.perReview });
  } catch (err) {
    console.error("getReviewAmount: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const claimReviewAmount = async (req, res) => {
  try {
    const { email, url } = req.body || {};
    const emailInToken = req.user?.email;
    if (email !== emailInToken) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid Request" });
    }
    const coinSettings = await coinSettingCollection.findOne({
      type: "settings",
    });
    if (!coinSettings) {
      return res.send({ success: false, message: "coin settings not found" });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.send({ success: false, message: "User not found" });
    }
    if (!user?.isVerified) {
      return res.send({ success: false, message: "User is not verified" });
    }
    const coinHistory = {
      email: email,
      name: "Review Offer Claim",
      status: "pending",
      amount: coinSettings.perReview,
      createdAt: new Date(),
      info: {
        Link: url,
      },
    };
    const result = await coinHistoryCollection.insertOne(coinHistory);
    if (result.insertedId) {
      return res.send({ success: true, ...result });
    }
    res.send({ success: false, ...result, message: "something went wrong" });
  } catch (err) {
    console.error("claimReviewAmount: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const changeReviewStatus = async (req, res) => {
  try {
    const { id, status } = req.body || {};
    const coinHistory = await coinHistoryCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!coinHistory) {
      return res.send({ success: false, message: "Coin history not found" });
    }
    if (coinHistory.status === "success" || coinHistory.status === "cancel") {
      return res.send({ success: false, message: "Already claimed once" });
    }
    const user = await userCollection.findOne({ email: coinHistory.email });
    if (!user) {
      return res.send({ success: false, message: "User not found" });
    }
    if (status === "success") {
      const updateUser = await userCollection.updateOne(
        { email: user.email },
        {
          $set: {
            coins: user.coins + coinHistory.amount,
          },
        }
      );
    }
    const updateCoinHistory = await coinHistoryCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: status,
        },
      }
    );
    if (updateCoinHistory.modifiedCount) {
      return res.send({
        success: true,
        message: "Status changed successfully",
        status,
      });
    }
    res.send({ success: false, message: "Something went wrong" });
  } catch (err) {
    console.error("changeReviewStatus: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getCoinHistory = async (req, res) => {
  try {
    const { page, limit, email, showReview } = req.query || {};
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    console.log(showReview);
    if (!pageInt || !limitInt) {
      return res.status(400).send({ message: "Invalid page or limit value" });
    }
    const { email: emailInToken, role } = req.user || {};
    let filter = {};
    if (role === "user") {
      if (email && email !== emailInToken) {
        return res.status(400).send({ message: "Invalid user email" });
      }
      filter = { email: emailInToken };
    } else if (role === "admin") {
      filter = { email: { $regex: new RegExp(email, "i") } };
    }
    if (showReview === "true"){
      filter.name = "Review Offer Claim";
      filter.status = "pending";
    }
    const totalHistory = await coinHistoryCollection.countDocuments(filter);
      const result = await coinHistoryCollection.find(filter, {sort: {createdAt: -1}}).skip((pageInt-1)*limitInt).limit(limitInt).toArray();
    res.send({ history: result, totalHistory });
  } catch (err) {
    console.error("getCoinHistory: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const coinsLeadearboard = async (req, res) => {
  try {
    const result = await userCollection
      .find(
        {},
        {
          sort: { coins: -1 },
          projection: { name: 1, photo: 1, coins: 1, isVerified: 1 },
        }
      )
      .limit(10)
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("currentTopLeadearboard: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getCoinProduct = async (req, res) => {
  try {
    const { id } = req.query || {};
    const { role } = req.user || {};
    if (!id) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const result = await coinProductsCollection.findOne({
      _id: new ObjectId(id),
    });
    if (role === "user" && !result.isActive) {
      return res.send(null);
    }
    res.send(result);
  } catch (err) {
    console.error("getCoinProduct: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllCoinProducts = async (req, res) => {
  try {
    const { role } = req.user || {};
    let filter = {};
    if (role === "user") {
      filter = { isActive: true };
    }
    const result = await coinProductsCollection
      .find(filter, { sort: { price: 1 } })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("getAllCoinProducts: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addCoinProducts = async (req, res) => {
  try {
    const { title, shortDescription, price, stock, inputs } = req.body || {};
    const priceInt = parseInt(price);
    const stockInt = parseInt(stock);
    if (
      !title ||
      !shortDescription ||
      isNaN(priceInt) ||
      isNaN(stockInt) ||
      priceInt <= 0 ||
      stockInt < 0 ||
      inputs.length === 0
    ) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const product = {
      title,
      price: priceInt,
      shortDescription,
      stock: stockInt,
      isActive: true,
      inputs,
      createdAt: new Date(),
    };
    const result = await coinProductsCollection.insertOne(product);
    res.send(result);
  } catch (err) {
    console.error("addCoinProducts: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateCoinProducts = async (req, res) => {
  try {
    const { id } = req.query || {};
    const { title, shortDescription, price, stock, isActive, inputs } =
      req.body || {};
    const priceInt = parseInt(price);
    const stockInt = parseInt(stock);
    if (
      !id ||
      !title ||
      !shortDescription ||
      isNaN(priceInt) ||
      isNaN(stockInt) ||
      priceInt <= 0 ||
      stockInt < 0 ||
      inputs.length === 0 ||
      isActive === undefined
    ) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const product = {
      title,
      price: priceInt,
      shortDescription,
      stock: stockInt,
      isActive,
      inputs,
    };
    const result = await coinProductsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: product }
    );
    res.send(result);
  } catch (err) {
    console.error("updateCoinProducts: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteCoinProducts = async (req, res) => {
  try {
    const { id } = req.query || {};
    if (!id) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const result = await coinProductsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (err) {
    console.error("deleteCoinProducts: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};
module.exports = {
  getDailyCoinNumber,
  getCoinSettings,
  claimDailyCoin,
  updateCoinSetting,
  getReviewAmount,
  claimReviewAmount,
  changeReviewStatus,
  getCoinHistory,
  coinsLeadearboard,
  getCoinProduct,
  getAllCoinProducts,
  addCoinProducts,
  updateCoinProducts,
  deleteCoinProducts,
};
