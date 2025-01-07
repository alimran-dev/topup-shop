const { MongoClient } = require("mongodb");
require("dotenv").config();

let uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@127.0.0.1:27017`;
let dbName = "mezbaGamingDB";
if (process.env.PROJECT_ENV !== "production") {
  dbName = "topupDB";
  if (process.env.PROJECT_ENV === "development") {
    uri = `mongodb://127.0.0.1:27017`;
  }
}

const db_url = process.env.DB_URL;

const connectToDB = (cb) => {
  MongoClient.connect(db_url)
    .then((client) => {
      const database = client.db("topupDB");

      console.log("connected to DB");

      const dbCollections = {};
      dbCollections.userCollection = database.collection("users");
      dbCollections.orderCollection = database.collection("orders");
      dbCollections.unipinCollection = database.collection("unipins");
      dbCollections.idcodeCollection = database.collection("idcodes");
      dbCollections.weeklyMonthlyCollection =
        database.collection("weeklyMonthly");
      dbCollections.shellCollection = database.collection("shells");
      dbCollections.specialOfferCollection =
        database.collection("specialOffer");
      dbCollections.airdropCollection = database.collection("airdrops");
      dbCollections.lessIsMoreCollection = database.collection("lessIsMore");
      dbCollections.paymentMethodCollection =
        database.collection("paymentMethods");
      dbCollections.paymentMethodSummaryCollection = database.collection(
        "paymentMethodSummary"
      );
      dbCollections.noticeCollection = database.collection("notices");
      dbCollections.transactionCollection = database.collection("transactions");
      dbCollections.bkashTrxCollection = database.collection("bkashTrx");
      dbCollections.nagadTrxCollection = database.collection("nagadTrx");
      dbCollections.blockedTrxCollection = database.collection("blockedTrx");
      dbCollections.deviceIdCollections = database.collection("deviceIDs");
      dbCollections.addBalanceOfferCollections =
        database.collection("addBalanceOffer");
      dbCollections.rechargeCollection = database.collection("recharges");
      module.exports = { dbCollections };
      return cb();
    })
    .catch((err) => {
      console.log(err);
      return cb(err);
    });
};

module.exports = { connectToDB };
