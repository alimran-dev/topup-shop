const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const paymentMethodCollection = dbCollections.paymentMethodCollection;
const paymentMethodSummaryCollection =
  dbCollections.paymentMethodSummaryCollection;

const getMethods = async (req, res) => {
  try {
    const { role } = req.user;
    let filter = {};
    if (role === "user") {
      filter = { status: "active" };
    }
    const result = await paymentMethodCollection.find(filter).toArray();
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addMethod = async (req, res) => {
  try {
    const { provider, category, bonus, fee, number, status } = req.body;
    const newMethod = {
      provider,
      category,
      bonus: parseFloat(bonus),
      fee: parseFloat(fee),
      number,
      status,
    };
    const result = await paymentMethodCollection.insertOne(newMethod);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateMethod = async (req, res) => {
  try {
    const { id } = req.query;
    const { bonus, fee, number, status } = req.body;
    const updatedMethod = {
      $set: {
        bonus: parseFloat(bonus),
        fee: parseFloat(fee),
        number,
        status,
      },
    };
    const filter = { _id: new ObjectId(id) };
    const result = await paymentMethodCollection.updateOne(
      filter,
      updatedMethod,
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteMethod = async (req, res) => {
  try {
    const { id } = req.query;
    const filter = { _id: new ObjectId(id) };
    const result = await paymentMethodCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const methodSummary = async (req, res) => {
  try {
    const result = await paymentMethodSummaryCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const methodReset = async (req, res) => {
  try {
    const { method, id } = req.query;
    let doc;
    if (method === "bkash") {
      doc = { bkash: 0 };
    } else if (method === "nagad") {
      doc = { nagad: 0 };
    }
    const updatedDoc = {
      $set: doc,
    };
    const filter = { _id: new ObjectId(id) };
    const result = await paymentMethodSummaryCollection.updateOne(
      filter,
      updatedDoc,
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const adjustBalance = async (req, res) => {
  try {
    const { bkash, nagad } = req.body;
    if (!bkash && !nagad) {
      return res.send({
        success: false,
        message: "Invalid request. Provide a value",
      });
    }
    const updatedDoc = {
      $set: {
        bkashBalance: bkash,
        nagadBalance: nagad,
      },
    };
    const result = await paymentMethodSummaryCollection.updateOne(
      { doc: "summary" },
      updatedDoc,
      { upsert: true }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getMethods,
  addMethod,
  updateMethod,
  deleteMethod,
  methodSummary,
  methodReset,
  adjustBalance,
};
