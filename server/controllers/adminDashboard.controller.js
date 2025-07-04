const { dbCollections } = require("../config/db");
const { userCollection, orderCollection, unipinCollection, shellCollection } =
  dbCollections;

const getDashboardData = async (req, res) => {
  try {
    const balanceMetrics = await userCollection
      .aggregate([
        {
          $group: {
            _id: null,
            available: { $sum: "$balance" },
            totalSpent: { $sum: "$spent" },
          },
        },
        {
          $project: {
            _id: 0,
            totalBalance: { $sum: ["$available", "$totalSpent"] },
            totalSpent: 1,
            available: 1,
          },
        },
      ])
      .toArray();
    const orderMetrics = await orderCollection
      .aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            completedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "complete"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalOrders: 1,
            pendingOrders: 1,
            completedOrders: 1,
          },
        },
      ])
      .toArray();
    const unipinMetrics = await unipinCollection
      .aggregate([
        {
          $group: {
            _id: "$uc",
            codesCount: { $sum: { $size: "$codes" } },
          },
        },
        {
          $project: {
            uc: "$_id",
            codes: "$codesCount",
            _id: 0,
          },
        },
        {
          $sort: { uc: 1 },
        },
      ])
      .toArray();
    const shellMetrics = await shellCollection
      .aggregate([
        {
          $group: {
            _id: "$name",
            codesCount: { $sum: { $size: "$codes" } },
          },
        },
        {
          $project: {
            name: "$_id",
            codes: "$codesCount",
            _id: 0,
          },
        },
        {
          $sort: { uc: 1},
        }
      ])
      .toArray();
    const result = {
      balance: balanceMetrics[0],
      orders: orderMetrics[0],
      unipins: unipinMetrics,
      shells: shellMetrics,
    };
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getDashboardData };
