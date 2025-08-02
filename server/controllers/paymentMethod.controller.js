const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { axiosBkash } = require("../utils/axiosBkash");
const paymentMethodCollection = dbCollections.paymentMethodCollection;
const paymentMethodSummaryCollection =
  dbCollections.paymentMethodSummaryCollection;
const { transactionCollection, userCollection } = dbCollections || {};
require("dotenv").config();

const getMethods = async (req, res) => {
  try {
    const { role } = req.user;
    let filter = {};
    if (role === "user") {
      filter = { status: "active" };
    }
    const result = await paymentMethodCollection
      .find(filter)
      .project({ lastTime: 0, expires_in: 0, id_token: 0, refresh_token: 0 })
      .toArray();

    // Calculate today's completed transaction amounts for each payment method
    const methodIds = result.map((method) => method._id.toString());
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const transactionSummary = await transactionCollection
      .aggregate([
        {
          $match: {
            methodID: { $in: methodIds },
            status: "completed",
            time: { $gte: startOfDay },
          },
        },
        {
          $group: {
            _id: "$methodID",
            totalAmount: { $sum: "$amount" },
          },
        },
      ])
      .toArray();

    // Create a map for quick lookup
    const summaryMap = {};
    transactionSummary.forEach((item) => {
      summaryMap[item._id] = item.totalAmount;
    });

    // Add totalAmount to each payment method
    const resultWithTotals = result.map((method) => ({
      ...method,
      totalAmount: summaryMap[method._id.toString()] || 0,
    }));

    res.send(resultWithTotals);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getTodaysAdminAdd=async(req,res)=>{
  try{
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    const result = await transactionCollection.aggregate([
      {
        $match: {
          method: "Manual Admin",
          status: "completed",
          time: {$gte: startOfDay},
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: {$sum: "$amount"},
        }
      }
    ]).toArray();
    res.send(result[0]);
  }catch(err){
    console.error("getTodaysAdminAdd: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
}

const bkashCreatePayment = async (req, res) => {
  try {
    const { email, amount } = req.body || {};
    const token = req.token;
    const pendingCount = await transactionCollection.countDocuments({
      email,
      status: "pending",
    });
    if (pendingCount) {
      await transactionCollection.deleteOne({
        email: email,
        status: "pending",
      });
    }
    const paymentMethod = await paymentMethodCollection.findOne({
      type: "auto",
    });
    if (!paymentMethod) {
      return res.send({ success: false, message: "Payment method not found" });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.send({ success: false, message: "User not found" });
    }
    const { bonus, special_bonus, fee } = paymentMethod || {};
    const toPay = Math.ceil(amount + (amount * fee) / 100);
    let willAdd = parseFloat((amount + (amount * bonus) / 100).toFixed(2));
    if (amount % 5 === 0) {
      willAdd = parseFloat(
        (amount + (amount * special_bonus) / 100).toFixed(2)
      );
    }
    const invNumber = require("crypto").randomUUID().split("-")[4];
    const { data } = await axiosBkash.post(
      "/tokenized/checkout/create",
      {
        mode: "0011",
        payerReference: `${email}`,
        callbackURL: `${process.env.SERVER_DOMAIN}/payment/bkash/callback`,
        amount: toPay,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: invNumber,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token,
          "X-App-Key": process.env.BKASH_APP_KEY,
        },
      }
    );
    // console.log("api data", data);
    const transaction = {
      method: "Bkash Payment",
      amount: parseInt(amount),
      bonus: amount % 5 === 0 ? special_bonus : bonus,
      fee,
      toPay,
      willAdd,
      number: "",
      email,
      previousBalance: parseFloat(user.balance.toFixed(2)),
      attempt: 0,
      trxID: "",
      time: new Date(),
      paymentID: data?.paymentID,
      status: "pending",
      methodID: paymentMethod._id?.toString(),
    };
    const trxInsertResult = await transactionCollection.insertOne(transaction);
    if (trxInsertResult.insertedId) {
      res.send({ success: true, url: data.bkashURL });
    } else {
      res.send({ success: false, message: "Failed to create transaction" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const bkashCallback = async (req, res) => {
  try {
    const { paymentID, status } = req.query || {};
    const token = req.token || "";
    if (status === "cancel" || status === "failure") {
      return res.redirect(
        `${process.env.FRONTEND_DOMAIN}/payment/confirmation?status=${status}`
      );
    }
    if (status === "success") {
      const { data } = await axiosBkash.post(
        "/tokenized/checkout/execute",
        { paymentID },
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
            "X-App-Key": process.env.BKASH_APP_KEY,
          },
          timeout: 5000,
        }
      );
      console.log("status--", status, "execute payment--", data);
      if (data?.transactionStatus === "Completed") {
        const transaction = await transactionCollection.findOne({
          paymentID: paymentID,
          status: "pending",
        });
        const updateTrx = { trxID: data?.trxID, status: "completed" };
        const updateUser = {
          balance: parseFloat(
            transaction?.previousBalance + transaction?.willAdd
          ),
        };
        const trxUpdateResult = await transactionCollection.updateOne(
          { paymentID: paymentID },
          { $set: updateTrx }
        );
        const userUpdateResult = await userCollection.updateOne(
          { email: transaction.email },
          { $set: updateUser }
        );
        if (trxUpdateResult.modifiedCount && userUpdateResult.modifiedCount) {
          return res.redirect(
            `${process.env.FRONTEND_DOMAIN}/payment/confirmation?status=${status}`
          );
        } else {
          return res.redirect(
            `${process.env.FRONTEND_DOMAIN}/payment/confirmation?status=${status}`
          );
        }
      }
    }
    console.log("status--", status);
    return res.redirect(
      `${process.env.FRONTEND_DOMAIN}/payment/confirmation?status=failure`
    );
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addMethod = async (req, res) => {
  try {
    const {
      provider,
      category,
      bonus,
      specialBonus: special_bonus,
      fee,
      number,
      status,
    } = req.body;
    const newMethod = {
      type: "manual",
      provider,
      category,
      bonus: parseFloat(bonus),
      special_bonus: parseFloat(special_bonus),
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
    const { bonus, special_bonus, fee, number, status } = req.body;
    // console.log(req.body);
    const updatedMethod = {
      $set: {
        bonus: parseFloat(bonus),
        special_bonus: parseFloat(special_bonus),
        fee: parseFloat(fee),
        status,
      },
    };
    if (number) {
      updatedMethod.$set.number = number;
    }
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
    const filter = { _id: new ObjectId(id), type: "manual" };
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
    // if (!bkash && !nagad) {
    //   return res.send({
    //     success: false,
    //     message: "Invalid request. Provide a value",
    //   });
    // }
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
  getTodaysAdminAdd,
  addMethod,
  bkashCreatePayment,
  bkashCallback,
  updateMethod,
  deleteMethod,
  methodSummary,
  methodReset,
  adjustBalance,
};
