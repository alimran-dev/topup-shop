const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { cookieOption } = require("../utils/cookieOption");
const notificationSender = require("../utils/notificationSender");
const {
  orderCollection,
  unipinCollection,
  shellCollection,
  userCollection,
  rechargeCollection,
  serviceCollection,
  specialOfferCollection,
} = dbCollections || {};

const getAllOrder = async (req, res) => {
  try {
    const { email, page, limit } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    // console.log({ email, pageInt, limitInt });
    const emailDecoded = req.user?.email;
    if (email !== emailDecoded) {
      return res.status(401).send({ error: "unauthorized" });
    }
    const totalOrders = await orderCollection.countDocuments({
      email: email,
    });
    const result = await orderCollection
      .find({ email: email }, { sort: { updateTime: -1 } })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .toArray();
    res.send({ orders: result, total: totalOrders });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getLastOrder = async (req, res) => {
  try {
    const orders = await orderCollection
      .aggregate([
        { $sort: { _id: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "email",
            foreignField: "email",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $project: {
            package: "$name",
            price: 1,
            status: 1,
            "userDetails.name": 1,
            "userDetails.photo": 1,
            "userDetails.isVerified": 1,
          },
        },
        {
          $project: {
            package: 1,
            price: 1,
            status: 1,
            name: "$userDetails.name",
            photo: "$userDetails.photo",
            isVerified: "$userDetails.isVerified",
          },
        },
      ])
      .toArray();
    res.send(orders);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const orderAuto = async (req, res) => {
  try {
    const { id, email, quantity } = req.body;
    const { category } = req.params;
    const orderTime = new Date();
    // const email = req.query?.email;
    // const id = req.query?.id;
    // const quantity = req.query?.quantity;
    if (
      !id ||
      !email ||
      !quantity ||
      (category !== "unipin" && category !== "shell" && category !== "card")
    ) {
      return res.status(400).send({ error: "Item not found" });
    }
    const emailInToken = req.user?.email;
    if (email !== emailInToken) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ message: "unauthorized" });
    }
    const filter = { _id: new ObjectId(id) };
    let option;
    if (category === "unipin") {
      option = await unipinCollection.findOne(filter);
    } else if (category === "shell") {
      option = await shellCollection.findOne(filter);
    } else if (category === "card") {
      option = await rechargeCollection.findOne(filter);
    }
    if (!option) {
      return res.status(404).send({ error: "Item not Found" });
    } else if (quantity > option.codes.length) {
      return res
        .status(400)
        .send({ error: "Requested quantity exceeds available codes" });
    }
    const orderPrice = option.price * quantity;
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.status(401).send({ error: "User Not Found" });
    } else if (user.balance < orderPrice) {
      return res.status(400).send({ error: "You don't have enough balance" });
    }
    const userUpdate = await userCollection.updateOne(
      { email: email },
      {
        $set: {
          balance: user.balance - orderPrice,
          spent: user.spent + orderPrice,
          orders: user.orders + 1,
        },
      }
    );

    if (userUpdate.modifiedCount > 0) {
      const takenCodes = option.codes.slice(0, quantity);
      if (category === "unipin") {
        await unipinCollection.updateOne(filter, {
          $pull: { codes: { $in: takenCodes } },
        });
      } else if (category === "shell") {
        await shellCollection.updateOne(filter, {
          $pull: { codes: { $in: takenCodes } },
        });
      } else if (category === "card") {
        await rechargeCollection.updateOne(filter, {
          $pull: { codes: { $in: takenCodes } },
        });
      }
      const ordersCount = await orderCollection.countDocuments();
      const order = {
        optionID: new ObjectId(id),
        orderID: ordersCount + 1000,
        email: email,
        category: category,
        name: `${option.name} (${quantity} codes)`,
        price: orderPrice,
        orderTime: orderTime,
        updateTime: new Date(),
        codes: takenCodes,
        status: "complete",
        feedback: "",
      };
      console.log("orderAuto: ", order);
      const result = await orderCollection.insertOne(order);
      res.status(201).send({ orderID: result.insertedId, price: orderPrice });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const orderDynamic = async (req, res) => {
  try {
    const { id, email, index, name, price, info } = req.body;
    const orderTime = new Date();
    const emailInToken = req.user?.email;
    if (email !== emailInToken) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ message: "unauthorized" });
    }
    const service = await serviceCollection.findOne({ _id: new ObjectId(id) });
    if (!service) {
      return res.send({ success: false, message: "Service not found" });
    }
    if (Object.keys(info).length !== service.inputs.length) {
      return res.send({ success: false, message: "Invalid order" });
    }
    const option = service.options[parseInt(index)];
    if (!option || option.name !== name || option.price !== parseInt(price)) {
      return res.send({ success: false, message: "Invalid option" });
    }
    if (option.stock <= 0) {
      return res.send({ success: false, message: "Stock unavailable" });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.status(401).send({ error: "User Not Found" });
    } else if (user.balance < option.price) {
      return res.status(400).send({ error: "You don't have enough balance" });
    }
    const userUpdate = await userCollection.updateOne(
      { email: email },
      {
        $set: {
          balance: user.balance - option.price,
          spent: user.spent + option.price,
          orders: user.orders + 1,
        },
      }
    );
    const ordersCount = await orderCollection.countDocuments();
    if (userUpdate.modifiedCount > 0) {
      const order = {
        orderID: ordersCount + 1000,
        email: email,
        category: service?.category,
        subCategory: service?.title,
        name: option.name,
        price: option.price,
        orderTime: orderTime,
        updateTime: new Date(),
        status: "pending",
        feedback: "",
        info: info,
      };
      console.log("dynamic order--", order);
      service.options[parseInt(index)].stock--;
      await serviceCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { options: service.options } }
      );
      const adminUsers = await userCollection.find({ role: "admin" }).toArray();
      adminUsers.map((admin) => {
        if (admin.subscription) {
          notificationSender(
            admin.subscription,
            "New Pending Order",
            option.name,
            "https://mezbashop.com/dashboard/orders"
          );
        }
      });
      const result = await orderCollection.insertOne(order);
      res.send({ ...result, success: true, price: option.price });
    } else {
      return res.send({
        success: false,
        message: "Failed to update user balance",
      });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const orderRechargeOffer = async (req, res) => {
  try {
    const { id, email, type, phone } = req.body || {};
    const orderTime = new Date();
    const emailInToken = req.user?.email;
    if (email !== emailInToken) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ message: "unauthorized" });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.send({ success: false, message: "User does not exists" });
    }
    const option = await rechargeCollection.findOne({ _id: new ObjectId(id) });
    if (!option) {
      return res.send({ success: false, message: "Option does not exists" });
    }
    if (option.stock === 0) {
      return res.send({ success: false, message: "Stock out" });
    }
    if (option.price > user.balance) {
      return res.send({
        success: false,
        message: "You don't have enough balance",
      });
    }
    const userUpdate = await userCollection.updateOne(
      { email: email },
      {
        $set: {
          balance: user.balance - option.price,
          spent: user.spent + option.price,
          orders: user.orders + 1,
        },
      }
    );
    if (userUpdate.modifiedCount) {
      const ordersCount = await orderCollection.countDocuments();
      const simCompany = await rechargeCollection.findOne({
        _id: new ObjectId(option.docId),
      });
      const order = {
        optionID: new ObjectId(id),
        orderID: ordersCount + 1000,
        email: email,
        category: "Recharge and Offers",
        subCategory: "Recharge Offer",
        name: `${option.name}`,
        price: option.price,
        orderTime: orderTime,
        updateTime: new Date(),
        status: "pending",
        feedback: "",
        info: {
          Type: type,
          Number: phone,
          Sim: simCompany.name,
        },
      };
      // option stock update
      await rechargeCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { stock: option.stock - 1 } }
      );

      // notification to the admins
      const adminUsers = await userCollection.find({ role: "admin" }).toArray();
      adminUsers.map((admin) => {
        if (admin.subscription) {
          notificationSender(
            admin.subscription,
            "New Pending Order",
            option.name,
            "https://mezbashop.com/dashboard/orders"
          );
        }
      });
      const result = await orderCollection.insertOne(order);
      return res.send({ ...result, success: true, price: option.price });
    }
    res.send({ success: false, message: "Something went wrong" });
  } catch (err) {
    console.error("orderRechargeOffer: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const orderBalanceRecharge = async (req, res) => {
  try {
    const { email, phone, price, company, type } = req.body || {};
    const priceInt = parseInt(price);
    if (!email) {
      return res.status(400).send({ message: "Must provide user email" });
    } else if (!phone) {
      return res.status(400).send({ message: "Must provide phone number" });
    } else if (isNaN(priceInt) || priceInt < 20) {
      return res
        .status(400)
        .send({ message: "Amount must be minimum 20 taka" });
    }
    const orderTime = new Date();
    const emailInToken = req.user?.email;
    if (email !== emailInToken) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ message: "unauthorized" });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.status(401).send({ error: "User Not Found" });
    } else if (user.balance < priceInt) {
      return res.status(400).send({ error: "You don't have enough balance" });
    }
    const userUpdate = await userCollection.updateOne(
      { email: email },
      {
        $set: {
          balance: user.balance - priceInt,
          spent: user.spent + priceInt,
          orders: user.orders + 1,
        },
      }
    );
    const ordersCount = await orderCollection.countDocuments();
    if (userUpdate.modifiedCount > 0) {
      const order = {
        orderID: ordersCount + 1000,
        email: email,
        category: "Recharge and Offers",
        subCategory: "Balance Recharge",
        name: `${price} taka recharge`,
        price: priceInt,
        orderTime: orderTime,
        updateTime: new Date(),
        status: "pending",
        feedback: "",
        info: {
          Type: type,
          Sim: company,
          Number: phone,
        },
      };
      const adminUsers = await userCollection.find({ role: "admin" }).toArray();
      adminUsers.map((admin) => {
        if (admin.subscription) {
          notificationSender(
            admin.subscription,
            "New Pending Order",
            `${price} taka recharge`,
            "https://mezbashop.com/dashboard/orders"
          );
        }
      });
      const result = await orderCollection.insertOne(order);
      return res.send({ ...result, success: true, price: priceInt });
    }
    res.status(400).send({ message: "Something wrong" });
  } catch (err) {
    console.error("Order Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const orderSpecialOffer = async (req, res) => {
  try {
    const { id, email, info } = req.body || {};
    if (!email || !id) {
      return res.status(400).send({ message: "Invalid request" });
    }
    const orderTime = new Date();
    const emailInToken = req.user?.email;
    if (email !== emailInToken) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ message: "unauthorized" });
    }
    const option = await specialOfferCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!option) {
      return res.status(400).send({ message: "Product not found" });
    }
    if (!option.isActive) {
      return res.status(400).send({ message: "Offer is not active now" });
    }
    if (Object.keys(info).length !== option.inputs.length) {
      return res.status(400).send({ message: "Invalid order" });
    }
    if (option.claimedBy.includes(email)) {
      return res
        .status(400)
        .send({ message: "You already claimed this offer" });
    }
    if (option.stock <= 0) {
      return res.status(400).send({ message: "Stock out" });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.status(401).send({ message: "User Not Found" });
    } else if (
      (option.type === "balance" && user.balance < option.price) ||
      (option.type === "coin" && user.coins < option.price)
    ) {
      return res.status(400).send({ message: "You don't have enough balance" });
    }
    const userUpdateDoc = {};
    if (option.type === "balance") {
      userUpdateDoc.balance = user.balance - option.price;
      userUpdateDoc.spent = user.spent + option.price;
      userUpdateDoc.orders = user.orders + 1;
    } else if (option.type === "coin") {
      userUpdateDoc.coins = user.coins - option.price;
    }
    const userUpdate = await userCollection.updateOne(
      { email: email },
      {
        $set: userUpdateDoc,
      }
    );
    const ordersCount = await orderCollection.countDocuments();
    if (userUpdate.modifiedCount > 0) {
      const order = {
        orderID: ordersCount + 1000,
        email: email,
        category: "Special Offer",
        subCategory: "Special Offer",
        name: option.title,
        price: option.price,
        orderTime: orderTime,
        updateTime: new Date(),
        status: "pending",
        feedback: "",
        info: { ...info, type: option.type },
      };
      const updatedDoc = {
        stock: option.stock - 1,
      };
      await specialOfferCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedDoc, $push: { claimedBy: email } }
      );
      const adminUsers = await userCollection.find({ role: "admin" }).toArray();
      adminUsers.map((admin) => {
        if (admin.subscription) {
          notificationSender(
            admin.subscription,
            "New Pending Order",
            option.title,
            "https://mezbashop.com/dashboard/orders"
          );
        }
      });
      const result = await orderCollection.insertOne(order);
      return res.send({
        ...result,
        success: true,
        price: option.price,
        type: option.type,
      });
    }
    res.status(400).send({ message: "Something went wrong" });
  } catch (err) {
    console.error("Order Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllOrderAdmin = async (req, res) => {
  try {
    const { page, limit, search, fromDate, toDate, category, subCategory } =
      req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    // console.log(pageInt, limitInt);
    let filter = {};
    if (search) {
      filter = { email: { $regex: new RegExp(search, "i") } };
    }
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    if (
      fromDate &&
      toDate &&
      (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime()))
    ) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    if (fromDate) {
      filter = {
        ...filter,
        orderTime: { $gte: fromDateObj, $lte: toDateObj },
        category: category,
        subCategory: subCategory,
      };
    }
    // console.log(filter);
    const totalOrders = await orderCollection.countDocuments(filter);
    const result = await orderCollection
      .find(filter, { sort: { updateTime: -1 } })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .toArray();
    res.send({ orders: result, totalOrders });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getPending = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    // console.log(pageInt, limitInt);
    const totalOrders = await orderCollection.countDocuments({
      status: "pending",
    });
    const result = await orderCollection
      .find({ status: "pending" }, { sort: { updateTime: -1 } })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .toArray();
    res.send({ orders: result, totalOrders });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const orderProcess = async (req, res) => {
  try {
    const { id, status: newStatus, feedback: newFeedback } = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateOrder = {
      $set: {
        status: newStatus,
        feedback: newFeedback || "",
        updateTime: new Date(),
      },
    };
    const order = await orderCollection.findOne(filter);
    const result = await orderCollection.updateOne(filter, updateOrder);
    if (newStatus === "cancelled") {
      await userCollection.updateOne(
        { email: order.email },
        { $inc: { balance: order.price, spent: -order.price } }
      );
    }
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const archivedUnipins = async (req, res) => {
  try {
    const { page, limit, search } = req.query || {};
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    if (isNaN(pageInt) || isNaN(limitInt)) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    if (!search) {
      return res.send({orders: [], totalOrders: 0});
    }
    const filter = { codes: { $in: [new RegExp(search, "i")] } };
    const result = await orderCollection
      .find(filter)
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .toArray();
    const total = await orderCollection.countDocuments(filter);
    res.send({ orders: result, totalOrders: total });
  } catch (err) {
    console.error("archivedUnipins: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getAllOrder,
  getLastOrder,
  orderAuto,
  orderDynamic,
  orderRechargeOffer,
  orderBalanceRecharge,
  orderSpecialOffer,
  getAllOrderAdmin,
  getPending,
  orderProcess,
  archivedUnipins,
};
