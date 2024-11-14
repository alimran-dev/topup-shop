const { cookieOption } = require("../utils/cookieOption");
const { dbCollections } = require("../config/db");
const userCollection = dbCollections.userCollection;
const orderCollection = dbCollections.orderCollection;
const transactionCollection = dbCollections.transactionCollection;

const countSpentMonth = async (email) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const pipeline = [
    {
      $match: {
        email,
        updateTime: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: "$price" },
      },
    },
  ];
  const orderStats = await orderCollection.aggregate(pipeline).toArray();
  const totalSpent = orderStats.length > 0 ? orderStats[0].totalSpent : 0;
  console.log(totalSpent);
  return totalSpent;
};

const userProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const filter = { email };
    console.log("user email in cookie: ", email);
    const result = await userCollection.findOne(filter);
    if (result?.isBanned) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ error: "User Blocked" });
    }
    if (result) {
      result.spent = await countSpentMonth(email);
    }
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const newUser = async (req, res) => {
  try {
    const user = req.body;
    const query = { email: user.email };
    const userInDb = await userCollection.findOne(query);
    if (userInDb) {
      return res.send({ userExist: true, newUser: false });
    }
    const newUser = {
      email: user.email,
      name: user.name,
      phone: user.phone,
      photo: user.photo,
      role: "user",
      isBanned: false,
      balance: 0,
      spent: 0,
      orders: 0,
    };
    console.log(newUser);
    const result = await userCollection.insertOne(newUser);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone, photo } = req.body;
    const emailDecoded = req.user?.email;
    if (email !== emailDecoded) {
      return res.status(401).send({ error: "Unauthorized" });
    }
    const updateUser = {
      $set: {},
    };
    if (name) {
      updateUser.$set.name = name;
    }
    if (phone) {
      updateUser.$set.phone = phone;
    }
    if (photo) {
      updateUser.$set.photo = photo;
    }
    const isUpdated = await userCollection.updateOne(
      { email: email },
      updateUser
    );
    if (isUpdated.modifiedCount > 0) {
      const user = await userCollection.findOne({ email: email });
      user.spent = await countSpentMonth(email);
      res.send(user);
    } else {
      res.status(501).send({ error: "Internal server Error" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllUser = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    console.log(pageInt, limitInt);
    let filter = {};
    if (search) {
      filter = { email: { $regex: new RegExp(search, "i") } };
    }
    const totalUsers = await userCollection.countDocuments(filter);
    const result = await userCollection
      .find(filter)
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .toArray();
    res.send({ users: result, totalUsers });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { isBanned, email } = req.body;
    const updatedUser = {
      $set: {
        isBanned: isBanned,
      },
    };
    const result = await userCollection.updateOne(
      { email: email },
      updatedUser
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateUserBalance = async (req, res) => {
  try {
    const { email, addBalance } = req.body;
    const addBalanceInt = parseFloat(addBalance);
    if (!addBalanceInt || isNaN(addBalanceInt)) {
      return res.status(400).send({ error: "Not Possible" });
    }
    const user = await userCollection.findOne({ email: email });
    if (user?.balance + addBalanceInt < 0) {
      return res.status(400).send({ error: "Not enough balance" });
    }
    const transaction = {
      method: "Manual Admin",
      amount: addBalanceInt,
      bonus: 0,
      fee: 0,
      toPay: addBalanceInt,
      willAdd: addBalanceInt,
      number: "",
      email,
      attempt: 0,
      trxID: "",
      time: new Date(),
      status: "completed",
    };
    await transactionCollection.insertOne(transaction);
    const result = await userCollection.updateOne(
      { email: email },
      { $inc: { balance: addBalanceInt } }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  userProfile,
  newUser,
  updateUser,
  getAllUser,
  updateUserStatus,
  updateUserBalance,
};
