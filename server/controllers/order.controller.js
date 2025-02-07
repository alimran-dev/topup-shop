const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { cookieOption } = require("../utils/cookieOption");
const orderCollection = dbCollections.orderCollection;
const unipinCollection = dbCollections.unipinCollection;
const shellCollection = dbCollections.shellCollection;
const userCollection = dbCollections.userCollection;
const rechargeCollection = dbCollections.rechargeCollection;
const serviceCollection = dbCollections.serviceCollection;

const getAllOrder = async (req, res) => {
  try {
    const { email, page, limit } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    console.log({ email, pageInt, limitInt });
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
            "userDetails.name": 1,
            "userDetails.photo": 1,
          },
        },
        {
          $project: {
            package: 1,
            price: 1,
            name: "$userDetails.name",
            photo: "$userDetails.photo",
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
      console.log(order);
      const result = await orderCollection.insertOne(order);
      res.status(201).send({ orderID: result.insertedId, price: orderPrice });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const orderManual = async (req, res) => {
  try {
    const { id, email, uid } = req.body;
    const { category } = req.params;
    const orderTime = new Date();
    if (!id || !email || !uid) {
      return res.status(400).send({ error: "Item Not Found" });
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
    if (category === "offer") {
      option = await rechargeCollection.findOne(filter);
    }
    if (!option) {
      return res.status(400).send({ error: "Item Not Found" });
    }
    const orderPrice = option.price;
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
      const ordersCount = await orderCollection.countDocuments();
      const order = {
        optionID: new ObjectId(id),
        orderID: ordersCount + 1000,
        email: email,
        category: category === "weekly" ? "weekly & monthly" : category,
        name: `${option.name} (${
          category === "offer" ? "Number" : "UID"
        }: ${uid})`,
        price: orderPrice,
        orderTime: orderTime,
        updateTime: new Date(),
        status: "pending",
        feedback: "",
      };
      console.log(order);
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
      console.log(order);
      service.options[parseInt(index)].stock--;
      await serviceCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { options: service.options } }
      );
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

const getAllOrderAdmin = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    console.log(pageInt, limitInt);
    const filter = {};
    if (search) {
      filter = { email: { $regex: new RegExp(search, "i") } };
    }
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
    console.log(pageInt, limitInt);
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

module.exports = {
  getAllOrder,
  getLastOrder,
  orderAuto,
  orderManual,
  orderDynamic,
  getAllOrderAdmin,
  getPending,
  orderProcess,
};
