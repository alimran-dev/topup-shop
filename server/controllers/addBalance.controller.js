const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { CONSTANTS } = require("../utils/constants");
const transactionCollection = dbCollections.transactionCollection;
const paymentMethodCollection = dbCollections.paymentMethodCollection;
const userCollection = dbCollections.userCollection;
const blockedTrxCollection = dbCollections.blockedTrxCollection;
const bkashTrxCollection = dbCollections.bkashTrxCollection;
const nagadTrxCollection = dbCollections.nagadTrxCollection;
const paymentMethodSummaryCollection =
  dbCollections.paymentMethodSummaryCollection;
const addBalanceOfferCollections = dbCollections.addBalanceOfferCollections;

const addBalance = async (req, res) => {
  try {
    const { amount, email, id, previousBalance } = req.body;
    if (amount >= 5000) {
      return res.send({
        message: `একসাথে সর্বোচ্চ ৪৯৯৯ টাকা অ্যাড করতে পারবেন।`,
      });
    }
    const pendingCount = await transactionCollection.countDocuments({
      email,
      status: "pending",
    });
    console.log(pendingCount);
    if (pendingCount > 0) {
      const transaction = await transactionCollection.findOne({
        email,
        status: "pending",
      });
      console.log(transaction);
      const timeNow = new Date();
      const timeDiff = timeNow.getTime() - transaction.time.getTime();
      let timeDiffSec = timeDiff / 1000;
      if (timeDiffSec < 5) {
        return res.send({
          message: `আপনার pending ট্রানজেকশন আছে। সেটি complete করুন অথবা আরও ${parseInt(
            5 - timeDiffSec
          )} সেকেন্ড অপেক্ষা করুন।`,
        });
      } else {
        await transactionCollection.deleteOne({ email, status: "pending" });
      }
    }
    const method = await paymentMethodCollection.findOne({
      _id: new ObjectId(id),
    });
    const { provider, category, bonus, fee, number, special_bonus } =
      method || {};
    let willAdd = parseFloat((amount + (amount * bonus) / 100).toFixed(2));
    if (amount % 5 === 0) {
      willAdd = parseFloat(
        (amount + (amount * special_bonus) / 100).toFixed(2)
      );
    }
    const transaction = {
      method: provider + " " + category,
      amount,
      bonus: amount % 5 === 0 ? special_bonus : bonus,
      fee,
      toPay: Math.ceil(amount + (amount * fee) / 100),
      willAdd,
      number,
      email,
      previousBalance,
      attempt: 0,
      trxID: "",
      time: new Date(),
      status: "pending",
    };
    const result = await transactionCollection.insertOne(transaction);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const checkAddBalance = async (req, res) => {
  try {
    const { email } = req.user;
    // const email = "test@gmail.com";
    const { id, trxID } = req.body;
    const invoice = await transactionCollection.findOne({
      _id: new ObjectId(id),
    });
    let trxSms = null;
    if (
      !invoice ||
      email !== invoice.email ||
      invoice?.status === "completed"
    ) {
      return res.status(403).send({
        success: false,
        isBanned: false,
        attempt: invoice?.attempt,
        message: "forbidden",
      });
    }
    if (invoice.attempt > 4) {
      const user = await userCollection.findOne({ email: email });
      const duration =
        (new Date().getTime() - user?.lastAttemptAddMoney?.getTime()) /
        (1000 * 60);
      const waitingDurationSeconds = 5;
      if (duration < waitingDurationSeconds) {
        return res.send({
          success: false,
          isBanned: false,
          attempt: invoice.attempt,
          message: `<p>অনুগ্রহ করে ${Math.ceil(
            waitingDurationSeconds - duration
          )} মিনিট পরে চেষ্টা করুন অথবা আমাদের সাথে যোগাযোগ করুন। <a href="${
            CONSTANTS.whatsappSupport
          }" style="color: blue;" target="_blank">WhatsApp</a> </p>`,
        });
      }
      await transactionCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { attempt: 0 } }
      );
      invoice.attempt = 0;
    }
    await transactionCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { attempt: 1 }, $set: { trxID } }
    );
    await userCollection.updateOne(
      { email: email },
      { $set: { lastAttemptAddMoney: new Date() } }
    );
    const provider = invoice?.method.split(" ")[0];
    const category = invoice?.method.split(" ")[1];
    const blockTrx = await blockedTrxCollection
      .find({ trxID: trxID })
      .toArray();
    let blockTrxFind = [];
    blockTrxFind = blockTrx.filter(
      (trxObj) => trxObj.provider === provider && trxObj.category === category
    );
    if (blockTrxFind.length) {
      return res.send({
        success: false,
        isBanned: false,
        attempt: invoice.attempt + 1,
        message: "এই ট্রানজেকশন আইডি ব্যবহার করা হয়েছে",
      });
    }
    if (provider === "bkash") {
      trxSms = await bkashTrxCollection.findOne({ trxID: trxID });
    } else if (provider === "nagad") {
      trxSms = await nagadTrxCollection.findOne({ trxID: trxID });
    }
    if (trxSms) {
      const providerInSms = trxSms.provider;
      const categoryInSms = trxSms.category;
      const amount = trxSms.amount;

      const timeNow = new Date();
      const timeDiff = timeNow.getTime() - trxSms.time?.getTime();
      const timeDiffHr = timeDiff / (1000 * 60 * 60);

      if (timeDiffHr >= 6) {
        return res.send({
          success: false,
          isBanned: false,
          attempt: invoice.attempt + 1,
          message:
            "আপনার ট্রানজেকশনটি ৬ ঘণ্টার বেশি হয়েছে। অনুগ্রহ করে সাপোর্টে কথা বলুন।",
        });
      }

      if (
        provider === providerInSms &&
        category === categoryInSms &&
        invoice?.toPay === amount
      ) {
        let delRes;
        if (provider === "bkash") {
          delRes = await bkashTrxCollection.deleteOne({
            trxID: trxID,
          });
        } else if (provider === "nagad") {
          delRes = await nagadTrxCollection.deleteOne({ trxID: trxID });
        }

        if (delRes?.deletedCount) {
          const { modifiedCount } = await userCollection.updateOne(
            { email: email },
            { $inc: { balance: invoice?.willAdd || 0 } }
          );
          if (modifiedCount) {
            const { modifiedCount: modStatus } =
              await transactionCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: "completed" } }
              );
            const [summary] = await paymentMethodSummaryCollection
              .find()
              .toArray();
            console.log(summary);
            if (provider === "bkash") {
              await paymentMethodSummaryCollection.updateOne(
                { _id: new ObjectId(summary._id) },
                { $inc: { bkash: amount } }
              );
            } else if (provider === "nagad") {
              await paymentMethodSummaryCollection.updateOne(
                { _id: new ObjectId(summary._id) },
                { $inc: { nagad: amount } }
              );
            }
            if (modStatus) {
              return res.send({
                success: true,
                isBanned: false,
                attempt: invoice.attempt + 1,
                message: "balance added and transaction completed",
              });
            } else {
              await userCollection.updateOne(
                { email: email },
                { $inc: { balance: invoice?.willAdd * -1 } }
              );
              return res.send({
                success: false,
                isBanned: false,
                attempt: invoice.attempt + 1,
                message:
                  "Something went wrong while updating transaction status",
              });
            }
          } else {
            return res.send({
              success: false,
              isBanned: false,
              attempt: invoice.attempt + 1,
              message: "Something went wrong while adding balance.",
            });
          }
        } else {
          return res.send({
            success: false,
            isBanned: false,
            attempt: invoice.attempt + 1,
            message: "Something went wrong. Please contact to support.",
          });
        }
      } else {
        return res.send({
          success: false,
          isBanned: false,
          attempt: invoice.attempt + 1,
          message:
            "You provided wrong information. Try again with correct information",
        });
      }
    } else {
      return res.send({
        success: false,
        isBanned: false,
        attempt: invoice.attempt + 1,
        message: "Please wait and try again later",
      });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addBalanceOffer = async (req, res) => {
  try {
    const result = await addBalanceOfferCollections.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addBalanceOfferUpdate = async (req, res) => {
  try {
    const { id } = req.query;
    const doc = req.body;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: doc,
    };
    const result = await addBalanceOfferCollections.updateOne(
      filter,
      updatedDoc,
      {
        upsert: true,
      }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  addBalance,
  checkAddBalance,
  addBalanceOffer,
  addBalanceOfferUpdate,
};
