const { MongoClient } = require("mongodb");
const { CONSTANTS } = require("../utils/constants");
require("dotenv").config();

// Item numbers are offset so the first one reads as a 4-digit code (1001)
const ITEM_NUMBER_BASE = 1000;

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
      dbCollections.likeSubscriptionCollection = database.collection("likeSubscriptions");
      dbCollections.categoryCollection = database.collection("categories");
      dbCollections.serviceItemCollection = database.collection("serviceItems");
      dbCollections.counterCollection = database.collection("counters");

      try {
        await dbCollections.unipinCollection.createIndex({code: 1}, {unique: true});
        await dbCollections.serviceItemCollection.createIndex({
          serviceId: 1,
          isActive: 1,
          isSold: 1,
        });
        await dbCollections.serviceItemCollection.createIndex({
          serviceId: 1,
          offerPrice: 1,
        });
        // backs the "recently sold" listing
        await dbCollections.serviceItemCollection.createIndex({
          serviceId: 1,
          isSold: 1,
          soldAt: -1,
        });
        // customer-facing unique item number. Partial so documents predating
        // this feature (no field yet) do not collide before the backfill runs.
        await dbCollections.serviceItemCollection.createIndex(
          { itemNumber: 1 },
          {
            unique: true,
            partialFilterExpression: { itemNumber: { $type: "number" } },
          }
        );
        console.log("Indexes created successfully");
      } catch (error) {
        console.log("Failed to create indexes", error?.message);
      }

      // One-time backfill: give any pre-existing item a number so every item
      // is displayable and searchable. No-op once every item has one.
      try {
        const missing = await dbCollections.serviceItemCollection
          .find({ itemNumber: { $exists: false } })
          .sort({ createdAt: 1, _id: 1 })
          .toArray();
        if (missing.length > 0) {
          const highest = await dbCollections.serviceItemCollection
            .find({ itemNumber: { $type: "number" } })
            .sort({ itemNumber: -1 })
            .limit(1)
            .toArray();
          let seq = highest.length ? highest[0].itemNumber - ITEM_NUMBER_BASE : 0;
          for (const item of missing) {
            seq += 1;
            await dbCollections.serviceItemCollection.updateOne(
              { _id: item._id },
              { $set: { itemNumber: ITEM_NUMBER_BASE + seq } }
            );
          }
          // keep the shared counter ahead of everything just assigned
          await dbCollections.counterCollection.updateOne(
            { _id: "serviceItemNumber" },
            { $max: { seq } },
            { upsert: true }
          );
          console.log(`Backfilled item numbers for ${missing.length} item(s)`);
        }
      } catch (error) {
        console.log("Failed to backfill item numbers", error?.message);
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
