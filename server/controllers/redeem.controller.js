const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { redeemCodesCollection, userCollection } = dbCollections || {};

const getAllRedeemCode = async (req, res) => {
  try {
    const { page, limit, code } = req.query || {};
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    let filter = {};
    if (code) {
      filter = { code: { $regex: new RegExp(code, "i") } };
    }
    const total = await redeemCodesCollection.countDocuments();
    const result = await redeemCodesCollection
      .find(filter)
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .toArray();
    res.send({ codes: result, total });
  } catch (err) {
    console.error("Redeem Code Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addRedeemCode = async (req, res) => {
  try {
    const { code, value, quantity, type, expiredAt } = req.body || {};
    const quantityInt = parseInt(quantity);
    const valueInt = parseInt(value);

    // check if all data is perfect or not
    if (!quantityInt) {
      return res.status(400).send({ message: "Invalid quantity" });
    } else if (!valueInt) {
      return res.status(400).send({ message: "Invalid value" });
    } else if (type !== "coin" && type !== "balance") {
      return res.status(400).send({ message: "Invalid redeem code type" });
    } else if (!code || !expiredAt) {
      return res.status(400).send({ message: "Invalid request" });
    }

    const isExist = await redeemCodesCollection.findOne({ code: code });
    if (isExist) {
      return res.status(400).send({ message: "This code already exists" });
    }

    // new redeem code object and inserting it to the collection
    const newRedeemCode = {
      type,
      code,
      value: valueInt,
      quantity: quantityInt,
      remaining: quantityInt,
      isActive: true,
      expiredAt: new Date(expiredAt),
      createdAt: new Date(),
      claimedBy: [],
    };
    const result = await redeemCodesCollection.insertOne(newRedeemCode);
    res.send(result);
  } catch (err) {
    console.error("Redeem Code Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const checkRedeemCode = async (req, res) => {
  try {
    const { email } = req.user || {};
    const { code } = req.body || {};
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(400).send({ message: "You are not a verified user" });
    }
    const codeDoc = await redeemCodesCollection.findOne({ code: code });
    if (!codeDoc) {
      return res.status(400).send({ message: "Invalid Redeem Code" });
    }
    const now = new Date().getTime();
    const expireTime = new Date(codeDoc.expiredAt).getTime();
    if (now > expireTime) {
      return res.status(400).send({ message: "Redeem code expired" });
    }
    const isClaimed = codeDoc.claimedBy.includes(email);
    if (isClaimed) {
      return res.status(400).send({ message: "You already claimed this." });
    }
    const updatedUser = {};
    const updatedCodeDoc = {};
    if (codeDoc.type === "balance") {
      updatedUser.balance = user.balance + codeDoc.value;
    } else if (codeDoc.type === "coin") {
      updatedUser.coins = user.coins + codeDoc.value;
    }
    updatedCodeDoc.remaining = codeDoc.remaining - 1;
    const userUpdateResult = await userCollection.updateOne(
      { email: email },
      { $set: updatedUser }
    );
    const codeDocUpdateResult = await redeemCodesCollection.updateOne(
      { code: code },
      { $set: updatedCodeDoc, $addToSet: {claimedBy: email} }
    );
    if (userUpdateResult.modifiedCount && codeDocUpdateResult.modifiedCount) {
      return res.send({ success: true, message: "Redeemed successfully" });
    }
    res.status(400).send({ message: "Something went wrong" });
  } catch (err) {
    console.error("Redeem Code Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateRedeemCode = async (req, res) => {
  try {
    const { id } = req.query;
    const { code, value, quantity, type, isActive, expiredAt } = req.body || {};
    const quantityInt = parseInt(quantity);
    const valueInt = parseInt(value);

    // check if all data is perfect or not
    if (!quantityInt) {
      return res.status(400).send({ message: "Invalid quantity" });
    } else if (!valueInt) {
      return res.status(400).send({ message: "Invalid value" });
    } else if (type !== "coin" && type !== "balance") {
      return res.status(400).send({ message: "Invalid redeem code type" });
    } else if (!code || !expiredAt || !id) {
      return res.status(400).send({ message: "Invalid request" });
    }
    const prevDoc = await redeemCodesCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!prevDoc) {
      return res.status(400).send({ message: "Redeem Code not found." });
    }
    const isExist = await redeemCodesCollection.countDocuments({ code: code });
    if (isExist && code !== prevDoc.code) {
      return res.status(400).send({ message: "This code already exists" });
    }
    const difference = quantityInt - prevDoc.quantity;
    let remaining = prevDoc.remaining;
    if (difference < 0) {
      if (Math.abs(difference) > prevDoc.remaining) {
        return res
          .status(400)
          .send({ message: "Quantity is less than number of claimed" });
      }
      remaining -= Math.abs(difference);
    } else {
      remaining += difference;
    }
    const updatedRedeemCode = {
      type,
      code,
      value: valueInt,
      quantity: quantityInt,
      remaining,
      isActive: isActive,
      expiredAt: new Date(expiredAt),
    };
    const result = await redeemCodesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedRedeemCode }
    );
    res.send(result);
  } catch (err) {
    console.error("Redeem Code Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteRedeemCode = async (req, res) => {
  try {
    const id = req.query;
    const result = await redeemCodesCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (err) {
    console.error("Redeem Code Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getAllRedeemCode,
  addRedeemCode,
  checkRedeemCode,
  updateRedeemCode,
  deleteRedeemCode,
};
