const { MongoClient } = require("mongodb");
const { CONSTANTS } = require("../utils/constants");
require("dotenv").config();

let uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@127.0.0.1:27017`;
let dbName = `${CONSTANTS.productionDBName}`;
if (process.env.PROJECT_ENV !== "production") {
  dbName = `${CONSTANTS.demoDBName}`;
  if (process.env.PROJECT_ENV === "development") {
    uri = `mongodb://127.0.0.1:27017`;
  }
}


const connectToDB = (cb) => {
  MongoClient.connect(process.env.DB_URI || `${uri}/${dbName}`)
    .then(async (client) => {
      const database = client.db(dbName);

      console.log("connected to DB");

      const dbCollections = {};
      dbCollections.serviceCollection = database.collection("services");
      dbCollections.adsCollection = database.collection("ads");
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
      dbCollections.bannerCollection = database.collection("banners");
      dbCollections.followUsCollection = database.collection("followUs");
      dbCollections.coinSettingCollection = database.collection("coinSettings");
      dbCollections.coinHistoryCollection = database.collection("coinHistory");
      dbCollections.redeemCodesCollection = database.collection("redeemCodes");
      dbCollections.reviewsCollection = database.collection("reviews");
      dbCollections.referHistoryCollection=database.collection("referHistory");
      dbCollections.coinProductsCollection=database.collection("coinProducts");

      try {
        await dbCollections.unipinCollection.createIndex({code: 1}, {unique: true});
        console.log("Indexes created successfully");
      } catch (error) {
        console.log("Failed to create indexes", error?.message);
      }

      module.exports = { dbCollections };
      return cb();
    })
    .catch((err) => {
      console.log(err);
      return cb(err);
    });
};

module.exports = { connectToDB };
