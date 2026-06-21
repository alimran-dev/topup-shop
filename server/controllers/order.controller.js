const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { cookieOption } = require("../utils/cookieOption");
const notificationSender = require("../utils/notificationSender");
const { CONSTANTS } = require("../utils/constants");
const { axiosAuto } = require("../utils/axiosAuto");
const {
  orderCollection,
  unipinCollection,
  shellCollection,
  userCollection,
  rechargeCollection,
  serviceCollection,
  specialOfferCollection,
  coinProductsCollection,
  coinSettingCollection,
  coinHistoryCollection,
} = dbCollections || {};
require("dotenv").config();

// to handle coin for every purchase of any referred user
const referPurchaseCoin = (user, price, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, spent, referredBy } = user || {};
      const coinSettings = await coinSettingCollection.findOne({
        type: "settings",
      });
      if (!coinSettings) {
        reject({ message: "coin settings not found" });
      }
      const {
        firstLevelAmount,
        secondLevelAmount,
        firstLevelCoin,
        secondLevelCoin,
        thirdLevelCoin,
      } = coinSettings || {};
      const level1 =
        Math.max(0, Math.min(firstLevelAmount - spent, price)) *
        (firstLevelCoin / 100);
      const level2 =
        Math.max(
          0,
          Math.min(secondLevelAmount, spent + price) -
            firstLevelAmount -
            Math.max(0, spent - firstLevelAmount)
        ) *
        (secondLevelCoin / 100);
      const level3 =
        (Math.max(0, spent + price - secondLevelAmount) -
          Math.max(0, spent - secondLevelAmount)) *
        (thirdLevelCoin / 100);
      const totalCoin = Math.round(level1 + level2 + level3);
      const coinHistory = {
        email: referredBy,
        name: "Refer Purchase Bonus",
        status: status,
        amount: totalCoin,
        createdAt: new Date(),
        info: {
          User: email,
          "Purchase Amount": price,
        },
      };
      const coinHistoryInsert = await coinHistoryCollection.insertOne(
        coinHistory
      );
      if (status === "success") {
        await userCollection.updateOne(
          { email: referredBy },
          { $inc: { coins: totalCoin } }
        );
      }
      resolve(coinHistoryInsert.insertedId.toString());
    } catch (err) {
      console.error("referPurchaseCoin: ", err.message);
      reject(err);
    }
  });
};

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
    const [orders, totalOrders] = await Promise.all([
      orderCollection
        .find({ email: email }, { sort: { updateTime: -1 } })
        .skip((pageInt - 1) * limitInt)
        .limit(limitInt)
        .project({
          referHistoryId: 0,
          coinBonusID: 0,
          order: 0,
          screenshots: 0,
        })
        .toArray(),
      orderCollection.countDocuments({ email: email }),
    ]);
    res.send({ orders, totalOrders });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getOrderImages = async (req, res) => {
  try {
    const { id } = req.query || {};
    if (!id) {
      return res.status(400).send({ error: "Invalid request" });
    }
    const order = await orderCollection.findOne({ _id: new ObjectId(id) });
    if (!order) {
      return res.status(404).send({ error: "Order not found" });
    }
    // Force HTTPS protocol for production/demo environments
    const protocol =
      req.secure ||
      req.get("x-forwarded-proto") === "https" ||
      process.env.PROJECT_ENV !== "development"
        ? "https"
        : "http";
    const host = req.get("host");
    const screenshots = order?.screenshots || [];
    const images = screenshots.map((image) => {
      const splitted = image?.split("/");
      const imgName = splitted[splitted.length - 1];
      return `${protocol}://${host}/auto/image?orderID=${order?.externalOrderId}&image=${imgName}`;
    });
    res.send({ success: true, images });
  } catch (err) {
    console.error("getOrderImages: ", err.message);
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
            type: 1,
            quantity: 1,
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
            type: 1,
            quantity: 1,
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
    // console.log("orderAuto---",id,email,quantity,category);
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
      let takenCodes = option.codes.slice(0, quantity);
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
        if (option?.operator === "GrameenPhone") {
          takenCodes = takenCodes.map((item) => "*555*" + item + "#");
        } else if (option?.operator === "Banglalink") {
          takenCodes = takenCodes.map((item) => "*123*" + item + "#");
        } else if (option?.operator === "Robi") {
          takenCodes = takenCodes.map((item) => "*111*" + item + "#");
        } else if (option?.operator === "Airtel") {
          takenCodes = takenCodes.map((item) => "*787*" + item + "#");
        }
        // console.log(takenCodes);
      }
      const ordersCount = await orderCollection.countDocuments();
      const order = {
        optionID: new ObjectId(id),
        orderID: ordersCount + 1000,
        email: email,
        category:
          category === "card" ? "Recharge & Offers" : "FF Topup & Unipin",
        subCategory: category,
        name: `${option.name} (${quantity} codes)`,
        price: orderPrice,
        orderTime: orderTime,
        updateTime: new Date(),
        codes: takenCodes,
        status: "complete",
        type: "balance",
        feedback: "",
      };
      if (user.referredBy && user?.isVerified) {
        const referHistoryId = await referPurchaseCoin(
          user,
          option.price,
          "success"
        );
        // console.log('referHistoryId--', referHistoryId?.toString());
        order.referHistoryId = referHistoryId;
      }
      if (option.coin && user?.isVerified) {
        const coinHistory = {
          email: email,
          name: "Product Purchase Bonus",
          status: "success",
          amount: option.coin * quantity,
          createdAt: new Date(),
          info: {
            "Product Price": option.price,
          },
        };
        const coinHistoryInsert = await coinHistoryCollection.insertOne(
          coinHistory
        );
        order.coinBonusID = coinHistoryInsert.insertedId.toString();
        await userCollection.updateOne(
          { email: email },
          { $inc: { coins: coinHistory.amount } }
        );
      }
      console.log("orderAuto: ", order);
      const result = await orderCollection.insertOne(order);
      res.status(201).send({ orderID: result.insertedId, price: orderPrice });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */

const orderDynamic = async (req, res) => {
  try {
    const {
      id,
      email,
      index,
      name,
      price,
      info,
      isAuto,
      willHaveQuantity,
      quantity,
    } = req.body;
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
    if (!isAuto && Object.keys(info).length !== service.inputs.length) {
      return res.send({ success: false, message: "Invalid order" });
    }
    if (isAuto && (info?.uid?.length < 7 || info?.uid?.length > 13)) {
      return res.send({ success: false, message: "Invalid UID" });
    }
    const option = service.options[parseInt(index)];
    if (!option || option.name !== name || option.price !== parseInt(price)) {
      return res.send({ success: false, message: "Invalid option" });
    }
    if (option.stock <= 0) {
      return res.send({ success: false, message: "Stock unavailable" });
    }
    const user = await userCollection.findOne({ email: email });
    const totalPrice = willHaveQuantity
      ? option.price * quantity
      : option.price;
    if (willHaveQuantity && quantity <= 0) {
      return res.status(400).send({ error: "Invalid quantity" });
    }
    if (!user) {
      return res.status(401).send({ error: "User Not Found" });
    } else if (user.balance < totalPrice) {
      return res.status(400).send({ error: "You don't have enough balance" });
    }
    const userUpdate = await userCollection.updateOne(
      { email: email },
      {
        $set: {
          balance: user.balance - totalPrice,
          spent: user.spent + totalPrice,
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
        price: totalPrice,
        orderTime: orderTime,
        updateTime: new Date(),
        status: "pending",
        feedback: "",
        type: "balance",
        info: info,
      };
      if (isAuto) {
        order.processedExternally = true;
      }
      if (willHaveQuantity) {
        order.quantity = quantity;
        order.info.quantity = quantity;
      }
      if (user.referredBy && user?.isVerified) {
        const referHistoryId = await referPurchaseCoin(
          user,
          option.price,
          "pending"
        );
        // console.log('referHistoryId--', referHistoryId?.toString());
        order.referHistoryId = referHistoryId;
      }
      if (option.coin && user?.isVerified) {
        const coinHistory = {
          email: email,
          name: "Product Purchase Bonus",
          status: "pending",
          amount: option.coin,
          createdAt: new Date(),
          info: {
            "Product Price": option.price,
          },
        };
        const coinHistoryInsert = await coinHistoryCollection.insertOne(
          coinHistory
        );
        order.coinBonusID = coinHistoryInsert.insertedId.toString();
      }
      // console.log("dynamic order--", order);
      service.options[parseInt(index)].stock--;
      await serviceCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { options: service.options } }
      );
      
      const protocol =
        req.secure ||
        req.get("x-forwarded-proto") === "https" ||
        process.env.PROJECT_ENV !== "development"
          ? "https"
          : "http";

      if (isAuto) {
        const ucs = [];
        const shellPackages = [];
        let totalUnipinToOrder = 0;

        if(service?.server === "unipin"){
          for(const item of option?.combo || []){
            if(item?.quantity>0){
              totalUnipinToOrder += (item?.quantity * quantity);
              for(let i=0;i<item?.quantity * quantity; i++){
                const uc = await unipinCollection.findOneAndDelete({uc: item?.uc});
                if(!uc) break;
                ucs.push(uc);
              }
            }
          }
        }
        const autoCombo = option?.combo?.reduce((acc, item) => {
          if (item?.quantity > 0) {
            if (service?.server === "indo") {
              acc.push({
                name: item?.name,
                label: item?.label,
                quantity: item?.quantity * quantity,
              });
            } else if (service?.server === "sg") {
              acc.push({
                name: item?.name,
                dollar: item?.dollar,
                quantity: item?.quantity * quantity,
              });
            } else if(service?.server === "unipin") {
              acc.push({
                name: item?.name,
                quantity: item?.quantity * quantity,
                uc: item?.uc
              });
            } else {
              acc.push({
                name: item?.name,
                package: item?.package,
                quantity: item?.quantity * quantity
              })
              for(let i = 0;i<item?.quantity * quantity || 0;i++){
                shellPackages.push(item?.package);
              }
            }
          }
          return acc;
        }, []);
        const callbackUrl = `${protocol}://${req.get("host")}/order/auto-server/processing`;
        const result = await orderCollection.insertOne(order);

        if(service?.server==="unipin"){
          if(ucs.length !== totalUnipinToOrder){
            await unipinCollection.insertMany(ucs);

            return res.send({...result, success: true, price: totalPrice})
          }else{
            const ucsArr = ucs.map((uc)=>uc?.code);
            order.codes = ucsArr;


            while(ucsArr.length){
              const ucsToClaim = ucsArr.splice(0,5);
              await axiosAuto.post("/topup",{
                orderid: result?.insertedId,
                playerid: info?.uid,
                code: ucsToClaim.join(','),
                url: callbackUrl,
              })
            }

            return res.send({...result, success: true, price: totalPrice});
          }
        } else if(service?.server === "my"){

          await axiosAuto.post("/topup",{
            orderid: result?.insertedId,
            playerid: info?.uid,
            code: "shell",
            url: callbackUrl,
            pacakge: shellPackages.join(','),
            username: process.env.SHELL_USERNAME,
            password: process.env.SHELL_PASSWORD,
            autocode: process.env.SHELL_AUTH_KEY
          })
          return res.send({...result, success: true, price: totalPrice});
        }
        // console.log("autoCombo: ", autoCombo, "quantity: ", quantity);
        const autoDoc = {
          uid: info?.uid,
          option: autoCombo,
          callback: `${protocol}://${req.get(
            "host"
          )}/order/auto-server/processing`,
          server: service?.server,
          email: "mezbakhan65@gmail.com",
        };
        if (service?.server === "sg") {
          autoDoc.dollar = autoCombo[0]?.dollar || 0;
        }
        // try {
        //   const { data } = await axiosAuto.post("/new-order", autoDoc);
        //   order.externalOrderId = data?.orderId;
        // } catch (err) {
        //   console.error("orderDynamic: ", err.message);
        // }
      }
      const adminUsers = await userCollection.find({ role: "admin" }).toArray();
      adminUsers.map((admin) => {
        if (admin.subscription) {
          notificationSender(
            admin.subscription,
            "New Pending Order",
            option.name,
            `https://${CONSTANTS.domain}/dashboard/orders`
          );
        }
      });
      // const result = await orderCollection.insertOne(order);
      // res.send({ ...result, success: true, price: totalPrice });
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
        type: "balance",
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

      if (user.referredBy && user?.isVerified) {
        const referHistoryId = await referPurchaseCoin(
          user,
          option.price,
          "pending"
        );
        // console.log('referHistoryId--', referHistoryId?.toString());
        order.referHistoryId = referHistoryId;
      }

      if (option.coin && user?.isVerified) {
        const coinHistory = {
          email: email,
          name: "Product Purchase Bonus",
          status: "pending",
          amount: option.coin,
          createdAt: new Date(),
          info: {
            "Product Price": option.price,
          },
        };
        const coinHistoryInsert = await coinHistoryCollection.insertOne(
          coinHistory
        );
        order.coinBonusID = coinHistoryInsert.insertedId.toString();
      }

      // notification to the admins
      const adminUsers = await userCollection.find({ role: "admin" }).toArray();
      adminUsers.map((admin) => {
        if (admin.subscription) {
          notificationSender(
            admin.subscription,
            "New Pending Order",
            option.name,
            `https://${CONSTANTS.domain}/dashboard/orders`
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
        type: "balance",
        info: {
          Type: type,
          Sim: company,
          Number: phone,
        },
      };
      if (user.referredBy && user.isVerified) {
        const referHistoryId = await referPurchaseCoin(
          user,
          priceInt,
          "pending"
        );
        // console.log('referHistoryId--', referHistoryId?.toString());
        order.referHistoryId = referHistoryId;
      }
      const adminUsers = await userCollection.find({ role: "admin" }).toArray();
      adminUsers.map((admin) => {
        if (admin.subscription) {
          notificationSender(
            admin.subscription,
            "New Pending Order",
            `${price} taka recharge`,
            `https://${CONSTANTS.domain}/dashboard/orders`
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
    const { id, email, info, quantity=1 } = req.body || {};
    console.log(req.body);
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
    if (!option?.isAuto && Object.keys(info).length !== option.inputs.length) {
      return res.status(400).send({ message: "Invalid order" });
    }
    const emailClaimCount = option.claimedBy.filter(
      (claimedEmail) => claimedEmail === email
    ).length;
    if (emailClaimCount + quantity > option.maxClaim) {
      return res
        .status(400)
        .send({ message: "You already claimed this offer" });
    }
    if (option.stock <= 0) {
      return res.status(400).send({ message: "Stock out" });
    }
    const user = await userCollection.findOne({ email: email });
    const totalPrice = option.price * quantity;
    if (!user) {
      return res.status(401).send({ message: "User Not Found" });
    } else if (
      (option.type === "balance" && user.balance < totalPrice) ||
      (option.type === "coin" && user.coins < totalPrice)
    ) {
      return res.status(400).send({ message: "You don't have enough balance" });
    }
    const userUpdateDoc = {};
    if (option.type === "balance") {
      userUpdateDoc.balance = user.balance - totalPrice;
      userUpdateDoc.spent = user.spent + totalPrice;
      userUpdateDoc.orders = user.orders + 1;
    } else if (option.type === "coin") {
      userUpdateDoc.coins = user.coins - totalPrice;
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
        price: totalPrice,
        orderTime: orderTime,
        updateTime: new Date(),
        status: "pending",
        feedback: "",
        type: option.type,
        info: { ...info },
      };
      if (option?.isAuto) {
        order.processedExternally = true;
      }
      if (option?.willHaveQuantity) {
        order.quantity = quantity;
        order.info.quantity = quantity;
      }
      if(option?.isAuto){
        const autoCombo = option?.combo?.reduce((acc, item) => {
          if (item?.quantity > 0) {
            if (option?.autoServer === "indo") {
              acc.push({
                name: item?.name,
                label: item?.label,
                quantity: item?.quantity * quantity,
              });
            } else if (option?.autoServer === "sg") {
              acc.push({
                name: item?.name,
                dollar: item?.dollar,
                quantity: item?.quantity * quantity,
              });
            } else {
              acc.push({
                name: item?.name,
                quantity: item?.quantity * quantity,
              });
            }
          }
          return acc;
        }, []);
        const protocol =
          req.secure ||
          req.get("x-forwarded-proto") === "https" ||
          process.env.PROJECT_ENV !== "development"
            ? "https"
            : "http";
        // console.log("autoCombo: ", autoCombo, "quantity: ", quantity);
        const autoDoc = {
          uid: info?.uid,
          option: autoCombo,
          callback: `${protocol}://${req.get(
            "host"
          )}/order/auto-server/processing`,
          server: option?.autoServer,
          email: "mezbakhan65@gmail.com",
        };
        if (option?.autoServer === "sg") {
          autoDoc.dollar = autoCombo[0]?.dollar || 0;
        }
        try {
          const { data } = await axiosAuto.post("/new-order", autoDoc);
          order.externalOrderId = data?.orderId;
        } catch (err) {
          console.error("orderDynamic: ", err.message);
        }
      }
      if (user.referredBy && option.type === "balance" && user.isVerified) {
        const referHistoryId = await referPurchaseCoin(
          user,
          option.price,
          "pending"
        );
        // console.log('referHistoryId--', referHistoryId?.toString());
        order.referHistoryId = referHistoryId;
      }
      const updatedDoc = {
        stock: option.stock - quantity,
      };
      const emailsToAdd = Array(quantity || 1).fill(email);
      await specialOfferCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedDoc, $push: { claimedBy: { $each: emailsToAdd } } }
      );
      const adminUsers = await userCollection.find({ role: "admin" }).toArray();
      adminUsers.map((admin) => {
        if (admin.subscription) {
          notificationSender(
            admin.subscription,
            "New Pending Order",
            option.title,
            `https://${CONSTANTS.domain}/dashboard/orders`
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

const orderCoinProduct = async (req, res) => {
  try {
    const { id, email, info } = req.body || {};
    if (!id || !email) {
      return res.status(400).send({ message: "Invalid Request" });
    }
    const orderTime = new Date();
    const emailInToken = req.user?.email;
    if (email !== emailInToken) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ message: "unauthorized" });
    }
    const option = await coinProductsCollection.findOne({
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
    if (option.stock <= 0) {
      return res.status(400).send({ message: "Stock out" });
    }
    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.status(401).send({ message: "User Not Found" });
    } else if (user.coins < option.price) {
      return res.status(400).send({ message: "You don't have enough balance" });
    }
    const userUpdate = await userCollection.updateOne(
      { email: email },
      { $set: { coins: user.coins - option.price } }
    );
    const ordersCount = await orderCollection.countDocuments();
    if (userUpdate.modifiedCount) {
      const order = {
        orderID: ordersCount + 1000,
        email: email,
        category: "Coin Product",
        subCategory: "Coin Product",
        name: option.title,
        price: option.price,
        orderTime: orderTime,
        updateTime: new Date(),
        status: "pending",
        feedback: "",
        type: "coin",
        info: info,
      };
      const updatedDoc = {
        stock: option.stock - 1,
      };
      await coinProductsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedDoc }
      );
      const result = await orderCollection.insertOne(order);
      return res.send({
        ...result,
        success: true,
        price: option.price,
      });
    }
  } catch (err) {
    console.error("orderCoinProduct: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllOrderAdmin = async (req, res) => {
  try {
    const { page, limit, search, fromDate, toDate, category, subCategory, orderID } =
      req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const orderIDInt = parseInt(orderID);
    // console.log(pageInt, limitInt);
    if(orderIDInt){
      const order = await orderCollection.findOne({ orderID: orderIDInt });
      return res.send({orders: order?[order]:[], totalOrders: order ? 1: 0});
    }
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
      // Set time to start of day for fromDate
      fromDateObj.setHours(0, 0, 0, 0);
      // Set time to end of day for toDate
      toDateObj.setHours(23, 59, 59, 999);
      filter = {
        ...filter,
        orderTime: { $gte: fromDateObj, $lte: toDateObj },
      };
    }
    if (category) {
      filter.category = category;
    }
    if (subCategory) {
      filter.subCategory = subCategory;
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

const getAllOrderAdminBK = async (req, res) => {
  try {
    const { search, fromDate, toDate, category, subCategory } = req.query || {};
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

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
      // Set time to start of day for fromDate
      fromDateObj.setHours(0, 0, 0, 0);
      // Set time to end of day for toDate
      toDateObj.setHours(23, 59, 59, 999);
      filter = {
        ...filter,
        orderTime: { $gte: fromDateObj, $lte: toDateObj },
      };
    }
    if (category) {
      filter.category = category;
    }
    if (subCategory) {
      filter.subCategory = subCategory;
    }

    const [orders, totalOrders] = await Promise.all([
      orderCollection
        .find(filter, { sort: { updateTime: -1 } })
        .skip(skip)
        .limit(limit)
        .toArray(),
      orderCollection.countDocuments(filter),
    ]);

    const externalMap = new Map();
    const externalIds = [];

    for (const order of orders) {
      if (order.processedExternally && order.externalOrderId) {
        externalIds.push(order.externalOrderId);
        externalMap.set(order.externalOrderId, order._id.toString());
      }
    }

    let externalResultMap = new Map();
    if (externalIds.length > 0) {
      try {
        const { data } = await axiosAuto.post("/order-info/all", {
          ids: externalIds,
        });

        // console.log(data?.orders);

        externalResultMap = new Map(data?.orders?.map((d) => [d.id, d]));
      } catch (err) {
        console.error("External batch fetch failed: ", err.message);
      }
    }

    const finalOrders = orders.map((order) => {
      if (order.processedExternally && order.externalOrderId) {
        const externalOrder = externalResultMap.get(order?.externalOrderId);
        const { _id: _, ...newExternalOrder } = externalOrder || {};
        return { ...order, ...newExternalOrder };
      }
      return { ...order };
    });
    res.send({ orders: finalOrders, totalOrders });
  } catch (err) {
    console.error("getAllOrderAdminNew: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllOrderSummary = async (req, res) => {
  try {
    const { search, fromDate, toDate, category, subCategory } = req.query;
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
      // Set time to start of day for fromDate
      fromDateObj.setHours(0, 0, 0, 0);
      // Set time to end of day for toDate
      toDateObj.setHours(23, 59, 59, 999);
      filter = {
        ...filter,
        orderTime: { $gte: fromDateObj, $lte: toDateObj },
      };
    }
    if (category) {
      filter.category = category;
    }
    if (subCategory) {
      filter.subCategory = subCategory;
    }
    // console.log(filter);
    const result = await orderCollection
      .aggregate([
        { $match: filter },
        {
          $facet: {
            totalOrders: [{ $count: "count" }],
            coinOrders: [{ $match: { type: "coin" } }, { $count: "count" }],
            balanceOrders: [
              { $match: { type: "balance" } },
              { $count: "count" },
            ],
            coinOrderAmount: [
              { $match: { type: "coin" } },
              { $group: { _id: null, totalAmount: { $sum: "$price" } } },
            ],
            balanceOrderAmount: [
              { $match: { type: "balance" } },
              { $group: { _id: null, totalAmount: { $sum: "$price" } } },
            ],
            totalCodeLength: [
              {
                $match: { codes: { $exists: true } },
              },
              {
                $group: {
                  _id: null,
                  totalLength: { $sum: { $size: "$codes" } },
                },
              },
            ],
          },
        },
        {
          $project: {
            "Total Orders": { $arrayElemAt: ["$totalOrders.count", 0] },
            "Total Coin Product Order": {
              $arrayElemAt: ["$coinOrders.count", 0],
            },
            "Total Balance Product Order": {
              $arrayElemAt: ["$balanceOrders.count", 0],
            },
            "Coin Product Order Amount": {
              $arrayElemAt: ["$coinOrderAmount.totalAmount", 0],
            },
            "Balance Product Order Amount": {
              $arrayElemAt: ["$balanceOrderAmount.totalAmount", 0],
            },
            "Total Codes": {
              $ifNull: [
                { $arrayElemAt: ["$totalCodeLength.totalLength", 0] },
                0,
              ],
            },
          },
        },
      ])
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("getAllOrderSummary: ", err.message);
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
      .find({ status: {$in: ["pending","failed"]} }, { sort: { updateTime: -1 } })
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
    if (order.coinBonusID) {
      const coinHistory = await coinHistoryCollection.findOne({
        _id: new ObjectId(order.coinBonusID),
      });
      if (newStatus === "complete") {
        await userCollection.updateOne(
          { email: coinHistory.email },
          { $inc: { coins: coinHistory.amount } }
        );
        await coinHistoryCollection.updateOne(
          { _id: coinHistory._id },
          { $set: { status: "success" } }
        );
      }
      if (newStatus === "cancelled") {
        await coinHistoryCollection.updateOne(
          { _id: coinHistory._id },
          { $set: { status: "cancel" } }
        );
      }
    }
    if (order.referHistoryId) {
      const coinHistory = await coinHistoryCollection.findOne({
        _id: new ObjectId(order.referHistoryId),
      });
      if (newStatus === "complete") {
        await userCollection.updateOne(
          { email: coinHistory.email },
          { $inc: { coins: coinHistory.amount } }
        );
        await coinHistoryCollection.updateOne(
          { _id: coinHistory._id },
          { $set: { status: "success" } }
        );
      }
      if (newStatus === "cancelled") {
        await coinHistoryCollection.updateOne(
          { _id: coinHistory._id },
          { $set: { status: "cancel" } }
        );
      }
    }
    if (newStatus === "cancelled" && order?.type === "balance") {
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

const autoServerOrderProcess = async (req, res) => {
  try {
    const {status, orderid, nickname, content} = req.body;

    console.log(req.body);
    
    const order = await orderCollection.findOne({ _id: new ObjectId(orderid) });
    if (!order) {
      return res.send({ success: false, message: "Order not found" });
    }

    let newStatus = status;

    if(order?.status==="pending"){
      if(status==="success")  newStatus = "complete";
      else newStatus = status;
    } else if(order?.status === "complete"){
      if(status==="success")  newStatus = "complete";
      else newStatus = "partial";
    } else {
      if(order?.status === "failed" && status === "failed") newStatus = "failed";
      else newStatus = "partial";
    }

    const contentDoc = [...(order?.order || [])];

    if(content?.batch && Array.isArray(content?.batch)){
      contentDoc.push(...content?.batch);
    } else {
      contentDoc.push(content);
    }
    
    const updatedDoc = {
      status: newStatus,
      feedback:  newStatus !== "complete" ? "অনুগ্রহপূর্বক অ্যাডমিনের সাথে যোগাযোগ করুন। ": "",
      updateTime: new Date(),
      order: contentDoc,
      info: {...order?.info, nickname},
      autoResponse: req?.body
    };
    // console.log(req.body);
    const result = await orderCollection.updateOne(
      { _id: new ObjectId(orderid) },
      { $set: updatedDoc }
    );
    if (order.coinBonusID) {
      const coinHistory = await coinHistoryCollection.findOne({
        _id: new ObjectId(order.coinBonusID),
      });
      if (newStatus === "complete" && coinHistory?.status !== "success") {
        await userCollection.updateOne(
          { email: coinHistory.email },
          { $inc: { coins: coinHistory.amount } }
        );
        await coinHistoryCollection.updateOne(
          { _id: coinHistory._id },
          { $set: { status: "success" } }
        );
      }
      if (newStatus === "cancelled") {
        await coinHistoryCollection.updateOne(
          { _id: coinHistory._id },
          { $set: { status: "cancel" } }
        );
      }
    }
    if (order.referHistoryId) {
      const coinHistory = await coinHistoryCollection.findOne({
        _id: new ObjectId(order.referHistoryId),
      });
      if (newStatus === "complete" && coinHistory?.status !== "success") {
        await userCollection.updateOne(
          { email: coinHistory.email },
          { $inc: { coins: coinHistory.amount } }
        );
        await coinHistoryCollection.updateOne(
          { _id: coinHistory._id },
          { $set: { status: "success" } }
        );
      }
      if (newStatus === "cancelled") {
        await coinHistoryCollection.updateOne(
          { _id: coinHistory._id },
          { $set: { status: "cancel" } }
        );
      }
    }
    if (newStatus === "cancelled" && order?.type === "balance") {
      await userCollection.updateOne(
        { email: order.email },
        { $inc: { balance: order.price, spent: -order.price } }
      );
    }
    res.send(result);
  } catch (err) {
    console.error("autoServerOrderProcess: ", err.message);
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
      return res.send({ orders: [], totalOrders: 0 });
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
  getOrderImages,
  getLastOrder,
  orderAuto,
  orderDynamic,
  orderRechargeOffer,
  orderBalanceRecharge,
  orderSpecialOffer,
  orderCoinProduct,
  getAllOrderAdmin,
  getAllOrderSummary,
  getPending,
  orderProcess,
  autoServerOrderProcess,
  archivedUnipins,
};
