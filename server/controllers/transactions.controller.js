const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const transactionCollection = dbCollections.transactionCollection;
const userCollection = dbCollections.userCollection;
const blockedTrxCollection = dbCollections.blockedTrxCollection;
const paymentMethodSummaryCollection =
  dbCollections.paymentMethodSummaryCollection;

const getTransaction = async (req, res) => {
  try {
    const { id, email } = req.query;
    const { email: emailInToken } = req.user;
    if (email !== emailInToken) {
      return res.status(401).send({ message: "unauthorized" });
    }
    const filter = { _id: new ObjectId(id) };
    const result = await transactionCollection.findOne(filter);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllTransaction = async (req, res) => {
  try {
    const { trxID, email, page, limit } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    const { email: emailCookie, role } = req.user;
    let mail;
    if (role === "user") {
      mail = emailCookie;
    } else if (role === "admin") {
      mail = email;
    }
    let filter = {};
    if (role === "user") {
      filter = { email: mail };
    } else if (role === "admin") {
      filter = {
        email: { $regex: new RegExp(mail, "i") },
        trxID: { $regex: new RegExp(trxID, "i") },
      };
    }
    const trxCount = await transactionCollection.countDocuments(filter);
    const result = await transactionCollection
      .find(filter)
      .sort({ time: -1 })
      .skip((pageInt - 1) * limit)
      .limit(limitInt)
      .toArray();
    res.send({ trxCount, transactions: result });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateTrxStatus = async (req, res) => {
  try {
    const { id, status } = req.query;
    if (status === "cancel") {
      const result = await transactionCollection.deleteOne({
        _id: new ObjectId(id),
      });
      return res.send(result);
    }
    const invoice = await transactionCollection.findOne({
      _id: new ObjectId(id),
    });
    const { method, email, trxID, toPay } = invoice || {};
    const provider = method.split(" ")[0];
    const category = method.split(" ")[1];
    const blockTrx = { provider, category, trxID };
    await userCollection.updateOne(
      { email: email },
      { $inc: { balance: invoice?.willAdd } }
    );
    await transactionCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "completed", method: method + "(Admin Approved)" } }
    );
    await blockedTrxCollection.insertOne(blockTrx);
    const [summary] = await paymentMethodSummaryCollection.find().toArray();
    if (provider === "bkash") {
      await paymentMethodSummaryCollection.updateOne(
        { _id: new ObjectId(summary._id) },
        { $inc: { bkash: toPay } }
      );
    } else if (provider === "nagad") {
      await paymentMethodSummaryCollection.updateOne(
        { _id: new ObjectId(summary._id) },
        { $inc: { nagad: toPay } }
      );
    }
    res.send({ completed: true, message: "updated status" });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getBlockTrx = async (req, res) => {
  try {
    const { trxID, page, limit } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const filter = { trxID: { $regex: new RegExp(trxID, "i") } };

    const totalTrx = await blockedTrxCollection.countDocuments(filter);
    const result = await blockedTrxCollection
      .find(filter)
      .sort({ _id: -1 })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .toArray();
    res.send({ totalTrx, blockedTrx: result });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addBlockTrx = async (req, res) => {
  try {
    const newBlock = req.body;
    const result = await blockedTrxCollection.insertOne(newBlock);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteBlockTrx = async (req, res) => {
  try {
    const { id } = req.query;
    const filter = { _id: new ObjectId(id) };
    const result = await blockedTrxCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getTransaction,
  getAllTransaction,
  updateTrxStatus,
  getBlockTrx,
  addBlockTrx,
  deleteBlockTrx,
};
