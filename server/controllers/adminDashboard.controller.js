const { dbCollections } = require("../config/db");
const {
  userCollection,
  orderCollection,
  unipinCollection,
  shellCollection,
  transactionCollection,
} = dbCollections;

const getDashboardData = async (req, res) => {
  try {
    const transactionMetrics = await transactionCollection
      .aggregate([
        {
          $group: {
            _id: null,
            added: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "completed"] },
                      { $eq: [{ $month: "$time" }, { $month: new Date() }] },
                      { $eq: [{ $year: "$time" }, { $year: new Date() }] },
                    ],
                  },
                  "$willAdd",
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            added: 1,
          },
        },
      ])
      .toArray();
    const balanceMetrics = await userCollection
      .aggregate([
        {
          $group: {
            _id: null,
            available: { $sum: "$balance" },
            totalSpent: { $sum: "$spent" },
            availableCoin: { $sum: "$coins" },
          },
        },
        {
          $project: {
            _id: 0,
            totalBalance: { $sum: ["$available", "$totalSpent"] },
            totalSpent: 1,
            available: 1,
            availableCoin: 1,
          },
        },
      ])
      .toArray();
    const orderMetrics = await orderCollection
      .aggregate([
        {
          $group: {
            _id: null,
            totalOrders: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: [{ $month: "$orderTime" }, { $month: new Date() }],
                      },
                      { $eq: [{ $year: "$orderTime" }, { $year: new Date() }] },
                      { $eq: ["$type", "balance"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            pendingOrders: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: [{ $month: "$orderTime" }, { $month: new Date() }],
                      },
                      { $eq: [{ $year: "$orderTime" }, { $year: new Date() }] },
                      { $eq: ["$status", "pending"] },
                      { $eq: ["$type", "balance"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            completedOrders: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: [{ $month: "$orderTime" }, { $month: new Date() }],
                      },
                      { $eq: [{ $year: "$orderTime" }, { $year: new Date() }] },
                      { $eq: ["$type", "balance"] },
                      { $eq: ["$status", "complete"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalSpent: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "complete"] },
                      {
                        $eq: [{ $month: "$orderTime" }, { $month: new Date() }],
                      },
                      { $eq: [{ $year: "$orderTime" }, { $year: new Date() }] },
                      { $eq: ["$type", "balance"] },
                    ],
                  },
                  "$price",
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalOrders: 1,
            pendingOrders: 1,
            completedOrders: 1,
            totalSpent: 1,
          },
        },
      ])
      .toArray();
    const unipinMetrics = await unipinCollection
      .aggregate([
        {
          $group: {
            _id: "$uc",
            codesCount: { $sum: 1 },
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
          $sort: { uc: 1 },
        },
      ])
      .toArray();
    balanceMetrics[0].totalSpent = orderMetrics[0].totalSpent || 0;
    balanceMetrics[0].totalBalance = transactionMetrics[0].added || 0;
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
