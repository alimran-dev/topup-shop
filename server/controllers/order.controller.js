const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { cookieOption } = require("../utils/cookieOption");
const notificationSender = require("../utils/notificationSender");
const { CONSTANTS } = require("../utils/constants");
const { axiosAuto } = require("../utils/axiosAuto");
const {axiosLike} = require("../utils/AxiosLike")
const {
  getActiveSubscriberTiers,
  getUnitPricesByServer,
  getUnitNormalPricesByServer,
  computeOptionSubscriberPrice,
  getSubscriptionThemesForEmails,
} = require("../utils/subscriberPricing");
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
  likeSubscriptionCollection,
  serviceItemCollection,
  siteSettingCollection,
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
        // Must return: without it execution continued with undefined settings,
        // producing totalCoin = NaN and writing NaN into the referrer's balance.
        return reject({ message: "coin settings not found" });
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
      orderCollection.aggregate([
        { $match: { email: email } },
        { $sort: { updateTime: -1 } },
        { $skip: (pageInt - 1) * limitInt },
        { $limit: limitInt },
        {
          $project: {
            referHistoryId: 0,
            coinBonusID: 0,
            order: 0,
            screenshots: 0,
          },
        },
        {
          $addFields: {
            codes: {
              $cond: [{ $eq: ["$isProcessedExternally", true] }, "$$REMOVE", "$codes"],
            },
          },
        },
      ]).toArray(),
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
            "userDetails.email": 1,
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
            email: "$userDetails.email",
          },
        },
      ])
      .toArray();

    // Most-valued (highest-priority active) subscription theme per order
    // owner — batch-resolved, one query pair for the whole feed.
    const themes = await getSubscriptionThemesForEmails(
      orders.map((o) => o.email)
    );

    // Home-tile settings: whether the price is masked. Absent doc ⇒ shown.
    const settings = await siteSettingCollection.findOne({ type: "settings" });

    const result = orders.map(({ email, ...order }) => {
      const theme = themes.get(email);
      if (theme) order.highlightColors = theme;
      return order;
    });
    res.send({ orders: result, showPrice: settings?.lastOrderShowPrice !== false });
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
    // Subscriber-effective unit price for recharge cards only; the legacy
    // unipin/shell branches keep the normal price.
    let effectiveUnitPrice = option.price;
    // activeTiers doubles as the "has valid subscription" signal for the
    // coin guard below (a subscribed user earns no product-purchase coins).
    // Computed for EVERY category — the guard applies to unipin/shell too.
    const activeTiers = await getActiveSubscriberTiers(email);
    if (category === "card") {
      const resolved = await computeOptionSubscriberPrice(
        option,
        null,
        activeTiers,
        null
      );
      effectiveUnitPrice = resolved?.price ?? option.price;
    }
    const orderPrice = effectiveUnitPrice * quantity;
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
          effectiveUnitPrice,
          "success"
        );
        // console.log('referHistoryId--', referHistoryId?.toString());
        order.referHistoryId = referHistoryId;
      }
      if (option.coin && user?.isVerified && !activeTiers?.length) {
        const coinHistory = {
          email: email,
          name: "Product Purchase Bonus",
          status: "success",
          amount: option.coin * quantity,
          createdAt: new Date(),
          info: {
            "Product Price": effectiveUnitPrice,
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
      trxID
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
    if (!option || option.name !== name) {
      return res.send({ success: false, message: "Invalid option" });
    }
    // Subscriber-effective unit price (server-authoritative): combos resolve
    // from the central per-unit prices (mix rule: priced units apply, unpriced
    // units keep their normal unit price), manual per-option maps override.
    const activeTiers = await getActiveSubscriberTiers(email);
    let unitPricesByKey = null;
    let unitNormalsByKey = null;
    // Unit-price maps only matter for subscribers — skip the two extra
    // queries for plain users (computeOptionSubscriberPrice returns null
    // without active tiers either way).
    if (service.isAuto && activeTiers.length) {
      [unitPricesByKey, unitNormalsByKey] = await Promise.all([
        getUnitPricesByServer(service.server),
        getUnitNormalPricesByServer(service.server),
      ]);
    }
    const resolved = await computeOptionSubscriberPrice(
      option,
      service.server,
      activeTiers,
      unitPricesByKey,
      unitNormalsByKey
    );
    const effectivePrice = resolved?.price ?? option.price;
    // Number() (not parseInt): subscriber prices can be non-integers (decimal
    // admin prices, or half-unit normal prices like 19/2 = 9.5) — parseInt
    // would truncate and reject the exact price the catalog showed.
    if (effectivePrice !== Number(price)) {
      return res.send({ success: false, message: "Invalid option" });
    }
    if (option.stock <= 0) {
      return res.send({ success: false, message: "Stock unavailable" });
    }
    const user = await userCollection.findOne({ email: email });
    const totalPrice = willHaveQuantity
      ? effectivePrice * quantity
      : effectivePrice;
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
        category: service?.categoryId?.toString(),
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
      if(trxID){
        order.trxID = trxID;
      }
      if (isAuto && service?.server!=="unipinNormal") {
        order.processedExternally = true;
      }
      if (willHaveQuantity) {
        order.quantity = quantity;
        order.info.quantity = quantity;
      }
      if (user.referredBy && user?.isVerified) {
        const referHistoryId = await referPurchaseCoin(
          user,
          effectivePrice,
          "pending"
        );
        // console.log('referHistoryId--', referHistoryId?.toString());
        order.referHistoryId = referHistoryId;
      }
      if (option.coin && user?.isVerified && !activeTiers?.length) {
        const coinHistory = {
          email: email,
          name: "Product Purchase Bonus",
          status: "pending",
          amount: option.coin,
          createdAt: new Date(),
          info: {
            "Product Price": effectivePrice,
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

        if(service?.server === "unipin" || service?.server === "unipinNormal"){
          for(const item of option?.combo || []){
            if(item?.quantity>0){
              totalUnipinToOrder += (item?.quantity * quantity);
              for(let i=0;i<item?.quantity * quantity; i++){
                // Guard: without a real uc, `{uc: undefined}` matches ANY doc
                // missing the field and would delete a random code — real
                // combo rows are {name, quantity} only, so this can never
                // auto-fulfill; skip and let the order stay pending.
                if (!item?.uc) break;
                const uc = await unipinCollection.findOneAndDelete({uc: item.uc});
                if(!uc) break;
                ucs.push(uc);
              }
            }
          }
        }

        if(service?.server === "unipinNormal"){
          if(ucs.length !== totalUnipinToOrder){
            if(ucs.length){
              await unipinCollection.insertMany(ucs);
            }
            order.status = "cancelled";
            order.updateTime = new Date();
            order.feedback = "এই Unipin কোডের স্টক শেষ। একটু অপেক্ষা করুন অথবা এডমিনের সাথে যোগাযোগ করুন।"
            const result = await orderCollection.insertOne(order);
            await userCollection.updateOne({email: email},{$set: {balance: user.balance}});
            return res.send({...result, success: true, price: 0});
          }
          const ucsArr = ucs.map(uc=>uc?.code);
          order.status = "complete";
          order.codes = ucsArr;
          order.updateTime = new Date();
          const result = await orderCollection.insertOne(order);
          return res.send({...result, success: true, price: totalPrice});
        }
        const autoCombo = option?.combo?.reduce((acc, item) => {
          if (item?.quantity > 0) {
            if(service?.server === "unipin") {
              acc.push({
                name: item?.name,
                quantity: item?.quantity * quantity,
                uc: item?.uc
              });
            }else {
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

        // If all combo quantities are 0, skip external API call and keep order as pending
        if(service?.server !== "unipin" && service?.server !== "unipinNormal" && service?.server !== "like" && (!autoCombo.length || !shellPackages.length)){
          return res.send({...result, success: true, price: totalPrice});
        }

        if(service?.server==="unipin"){
          if(ucs.length !== totalUnipinToOrder){
            if(ucs.length){
              await unipinCollection.insertMany(ucs);
            }

            return res.send({...result, success: true, price: totalPrice})
          }else{
            const ucsArr = ucs.map((uc)=>uc?.code);
            await orderCollection.updateOne({_id: new ObjectId(result.insertedId)}, {$set: {codes: ucsArr}})


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
        } else if(service?.server === "my" || service?.server === "indo" || service?.server==="sg"){

          const autoOrderData = {
            orderid: result?.insertedId,
            playerid: info?.uid,
            code: service?.server==="my"? "shell":service?.server==="sg"?"sgshell": "indo",
            url: callbackUrl,
            pacakge: shellPackages.join(','),
            username: service?.server==="sg" ? process.env.SHELL_SG_USERNAME: process.env.SHELL_USERNAME,
            password: service?.server==="sg" ? process.env.SHELL_SG_PASSWORD:process.env.SHELL_PASSWORD,
            autocode: service?.server==="sg" ? process.env.SHELL_SG_AUTH_KEY:process.env.SHELL_AUTH_KEY
          }
          
          const isLessIsMore = shellPackages.includes("lessismore");
          if(isLessIsMore){
            autoOrderData.code = "lessismore";
            autoOrderData.mode = "single";
            delete autoOrderData.pacakge;
          }

          await axiosAuto.post("/topup",autoOrderData);
          return res.send({...result, success: true, price: totalPrice});
        } else if(service?.server === "like"){
          const autoComboLike = option?.combo?.find(item=>item?.day>0);

          const {data: subscriptions} = await axiosLike.get("/subscriptions",{params: {active_only: true}});
          const hasSubscription = subscriptions?.data?.find(item=>item?.target_uid == info?.uid);
          const prevSubscription = await likeSubscriptionCollection.findOne({uid: info?.uid});
          const isValid = !prevSubscription ? true:(()=>{
            const prev = new Date(prevSubscription?.lastTaken);
            if(Number.isNaN(prev.getTime()))  return true;
            const today = new Date();
            return (prev.getUTCFullYear() !== today.getUTCFullYear() || prev.getUTCMonth()!== today.getUTCMonth() || prev.getUTCDate() !== today.getUTCDate())
          })();
          if(hasSubscription || !isValid){
            await userCollection.updateOne(
              { email: email },
              {
                $set: {
                  balance: user.balance,
                },
              }
            );
            await orderCollection.updateOne({_id: new ObjectId(result?.insertedId)},{
              $set: {
                updateTime: new Date(),
                status: "cancelled",
                feedback: "আপনার আজকের লিমিট শেষ। আগামীকাল আবার অর্ডার করতে পারবেন এই UID তে।",
                info: {...order.info, day: autoComboLike?.day},
              }
            });
            return res.send({...result, success: true, price: 0});
          }
          let subscribeData;
          try {
            const {data} = await axiosLike.get("/subscribe",{
              params: {
                uid: info?.uid,
                days: autoComboLike?.day,
                likes: autoComboLike?.package,
              }
            })
            subscribeData = data;
          } catch (error) {
            subscribeData = error;
            console.error("Like subscription: ",error);
          }
          await orderCollection.updateOne({_id: new ObjectId(result?.insertedId)},{$set:{
            updateTime: new Date(),
            status: "complete",
            feedback: "",
            info: {...order.info, day: autoComboLike?.day},
            autoResponse: subscribeData,
            order: subscribeData?.data
          }})
          await likeSubscriptionCollection.updateOne({uid: info?.uid},{$set: {lastTaken: new Date()}}, {upsert: true});
          return res.send({...result, success: true, price: totalPrice});
        }
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
      const result = await orderCollection.insertOne(order);
      res.send({ ...result, success: true, price: totalPrice });
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

// Purchase of a single unique listing item (serviceType: "itemListing").
// Unlike orderDynamic, the order is completed immediately — the admin-authored
// feedback stored on the item is what the buyer receives.
const orderItemListing = async (req, res) => {
  try {
    const { itemId, email, trxID } = req.body || {};
    const orderTime = new Date();
    const emailInToken = req.user?.email;
    if (email !== emailInToken) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ message: "unauthorized" });
    }
    if (!itemId) {
      return res.send({ success: false, message: "Invalid request" });
    }

    const item = await serviceItemCollection.findOne({
      _id: new ObjectId(itemId),
    });
    if (!item) {
      return res.send({ success: false, message: "Item not found" });
    }
    if (item.isActive === false) {
      return res.send({ success: false, message: "Item is not available" });
    }
    if (item.isSold) {
      return res.send({ success: false, message: "Item is already sold" });
    }

    const service = await serviceCollection.findOne({
      _id: new ObjectId(item.serviceId),
    });
    if (!service) {
      return res.send({ success: false, message: "Service not found" });
    }
    // The item is only purchasable while its parent service is still an active
    // item listing. Without this, items stay buyable by direct ID after an admin
    // deactivates the service or switches it back to a standard service.
    if (service.isActive === false || service.serviceType !== "itemListing") {
      return res.send({ success: false, message: "Item is not available" });
    }

    const user = await userCollection.findOne({ email: email });
    if (!user) {
      return res.status(401).send({ error: "User Not Found" });
    }
    const totalPrice = item.offerPrice ?? item.originalPrice;
    if (typeof totalPrice !== "number" || !isFinite(totalPrice) || totalPrice < 0) {
      return res.send({ success: false, message: "Item price is invalid" });
    }
    if (user.balance < totalPrice) {
      return res.status(400).send({ error: "You don't have enough balance" });
    }

    // Atomically claim the item so two simultaneous buyers can never both win.
    const claimResult = await serviceItemCollection.findOneAndUpdate(
      {
        _id: new ObjectId(itemId),
        isSold: { $ne: true },
        isActive: { $ne: false },
      },
      { $set: { isSold: true, soldTo: email, soldAt: new Date() } }
    );
    // Driver 6 returns the document directly; guard for the metadata shape too.
    const claimedItem =
      claimResult && Object.prototype.hasOwnProperty.call(claimResult, "value")
        ? claimResult.value
        : claimResult;
    if (!claimedItem) {
      return res
        .status(409)
        .send({ success: false, message: "Item is already sold" });
    }

    // Deduct the balance atomically: the `balance: { $gte: totalPrice }` guard
    // makes the affordability check and the deduction a single operation, so
    // concurrent purchases of different items cannot overdraw the account.
    // If it fails, release the claim so the item is not lost.
    const userUpdate = await userCollection.updateOne(
      { email: email, balance: { $gte: totalPrice } },
      {
        $inc: {
          balance: -totalPrice,
          spent: totalPrice,
          orders: 1,
        },
      }
    );
    if (!userUpdate.modifiedCount) {
      await serviceItemCollection.updateOne(
        { _id: new ObjectId(itemId) },
        { $set: { isSold: false }, $unset: { soldTo: 1, soldAt: 1 } }
      );
      return res
        .status(400)
        .send({ success: false, error: "You don't have enough balance" });
    }

    const ordersCount = await orderCollection.countDocuments();
    const statLabels = service.statLabels || [];
    const info = {};
    (item.stats || []).forEach((value, idx) => {
      const label = statLabels[idx];
      if (label) {
        info[label] = value;
      }
    });

    const order = {
      orderID: ordersCount + 1000,
      email: email,
      category: service?.categoryId?.toString(),
      subCategory: service?.title,
      name: item.title,
      price: totalPrice,
      orderTime: orderTime,
      updateTime: new Date(),
      status: "complete",
      feedback: item.feedback || "",
      type: "balance",
      orderType: "itemListing",
      itemId: item._id.toString(),
      info: info,
    };
    if (trxID) {
      order.trxID = trxID;
    }

    // Persist the order BEFORE any bonus work. The customer has already been
    // charged and the item claimed, so the order record is the critical piece:
    // if it cannot be written, undo the charge and release the item rather than
    // leaving the buyer with no proof of purchase.
    let result;
    try {
      result = await orderCollection.insertOne(order);
    } catch (insertErr) {
      console.error("orderItemListing (order insert failed): ", insertErr.message);
      await userCollection.updateOne(
        { email: email },
        { $inc: { balance: totalPrice, spent: -totalPrice, orders: -1 } }
      );
      await serviceItemCollection.updateOne(
        { _id: new ObjectId(itemId) },
        { $set: { isSold: false }, $unset: { soldTo: 1, soldAt: 1 } }
      );
      return res
        .status(500)
        .send({ success: false, error: "Internal Server Error" });
    }

    // The order completes immediately, so bonuses are settled right away instead
    // of waiting for an admin to process the order. Bonus failures must never
    // void a paid-for order, so they are non-fatal and recorded after the fact.
    try {
      const bonusFields = {};
      if (user.referredBy && user?.isVerified) {
        const referHistoryId = await referPurchaseCoin(
          user,
          totalPrice,
          "success"
        );
        bonusFields.referHistoryId = referHistoryId;
      }
      // Item listings have no subscriber pricing, so the subscription signal
      // is computed here: a subscribed buyer earns no product-purchase coins.
      const activeTiers = await getActiveSubscriberTiers(email);
      if (item.coin && user?.isVerified && !activeTiers?.length) {
        const coinHistory = {
          email: email,
          name: "Product Purchase Bonus",
          status: "success",
          amount: item.coin,
          createdAt: new Date(),
          info: {
            "Product Price": totalPrice,
          },
        };
        const coinHistoryInsert = await coinHistoryCollection.insertOne(
          coinHistory
        );
        bonusFields.coinBonusID = coinHistoryInsert.insertedId.toString();
        await userCollection.updateOne(
          { email: email },
          { $inc: { coins: item.coin } }
        );
      }
      if (Object.keys(bonusFields).length > 0) {
        await orderCollection.updateOne(
          { _id: result.insertedId },
          { $set: bonusFields }
        );
      }
    } catch (bonusErr) {
      console.error("orderItemListing (bonus settlement): ", bonusErr.message);
    }

    try {
      const adminUsers = await userCollection.find({ role: "admin" }).toArray();
      adminUsers.map((admin) => {
        if (admin.subscription) {
          notificationSender(
            admin.subscription,
            "New Item Order",
            item.title,
            `https://${CONSTANTS.domain}/dashboard/orders`
          );
        }
      });
    } catch (notifyErr) {
      console.error("orderItemListing (notification): ", notifyErr.message);
    }

    res.send({ ...result, success: true, price: totalPrice });
  } catch (err) {
    console.error("orderItemListing: ", err.message);
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
    // Subscriber-effective price from the manual per-option map
    const activeTiers = await getActiveSubscriberTiers(email);
    const resolved = await computeOptionSubscriberPrice(
      option,
      null,
      activeTiers,
      null
    );
    const chargePrice = resolved?.price ?? option.price;
    if (chargePrice > user.balance) {
      return res.send({
        success: false,
        message: "You don't have enough balance",
      });
    }
    const userUpdate = await userCollection.updateOne(
      { email: email },
      {
        $set: {
          balance: user.balance - chargePrice,
          spent: user.spent + chargePrice,
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
        price: chargePrice,
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
          chargePrice,
          "pending"
        );
        // console.log('referHistoryId--', referHistoryId?.toString());
        order.referHistoryId = referHistoryId;
      }

      if (option.coin && user?.isVerified && !activeTiers?.length) {
        const coinHistory = {
          email: email,
          name: "Product Purchase Bonus",
          status: "pending",
          amount: option.coin,
          createdAt: new Date(),
          info: {
            "Product Price": chargePrice,
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
      return res.send({ ...result, success: true, price: chargePrice });
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
    // Subscriber-type restriction — "see it, can't buy" (server-enforced).
    // Audience = the buyer's ACTIVE subscriber type ids, else ["normal"]
    // (plain users and admins). Absent/empty allowedRoles ⇒ everyone can buy.
    if (option.allowedRoles?.length) {
      const tiers = await getActiveSubscriberTiers(email);
      const audience =
        req.user?.role === "admin" || !tiers?.length
          ? ["normal"]
          : tiers.map((t) => t.typeId);
      if (!option.allowedRoles.some((r) => audience.includes(r))) {
        return res.status(403).send({
          success: false,
          message: "This offer is only for selected members",
        });
      }
    }
    if (!option?.isAuto && Object.keys(info || {}).length !== option.inputs.length) {
      return res.status(400).send({ message: "Invalid order" });
    }
    const emailClaimCount = option.claimedBy.filter(
      (claimedEmail) => claimedEmail === email
    ).length;
    // Blank/absent maxClaim ⇒ unlimited per email (any stored number — incl.
    // 0, which means "no purchases" — stays a real cap).
    if (option.maxClaim != null && emailClaimCount + quantity > option.maxClaim) {
      return res
        .status(400)
        .send({ message: "You already claimed this offer" });
    }
    // Per-input-value cap: each input field counted INDEPENDENTLY, globally
    // across all buyers. Auto offers count the player UID (their info only
    // carries uid). Blank/absent maxClaimPerInput ⇒ unlimited.
    if (option.maxClaimPerInput != null) {
      const claimedValues = option.claimedValues || [];
      const fields = option?.isAuto
        ? [{ field: "uid", value: info?.uid }]
        : (option.inputs || []).map((f) => ({ field: f, value: info?.[f] }));
      for (const { field, value } of fields) {
        if (!value) continue;
        const count = claimedValues.filter(
          (e) => e?.values?.[field] === value
        ).length;
        if (count + quantity > option.maxClaimPerInput) {
          return res.status(400).send({
            success: false,
            message: "This input value reached the purchase limit",
          });
        }
      }
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
      const claimUpdate = {
        $set: updatedDoc,
        $push: { claimedBy: { $each: emailsToAdd } },
      };
      // Record input values for the per-input cap (global across buyers) —
      // only when a cap is set, so legacy offers keep just claimedBy.
      if (option.maxClaimPerInput != null) {
        const valuesEntry = option?.isAuto
          ? { values: { uid: info?.uid } }
          : {
              values: Object.fromEntries(
                (option.inputs || []).map((f) => [f, info?.[f]])
              ),
            };
        claimUpdate.$push.claimedValues = {
          $each: Array(quantity || 1).fill(valuesEntry),
        };
      }
      await specialOfferCollection.updateOne(
        { _id: new ObjectId(id) },
        claimUpdate
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
      // Insert the order FIRST so the auto-server callback (which matches by
      // _id) can resolve it. The old code called /new-order BEFORE inserting
      // and never sent our own orderid, so auto offers could never complete.
      const result = await orderCollection.insertOne(order);
      if (option?.isAuto) {
        const protocol =
          req.secure ||
          req.get("x-forwarded-proto") === "https" ||
          process.env.PROJECT_ENV !== "development"
            ? "https"
            : "http";
        const callbackUrl = `${protocol}://${req.get(
          "host"
        )}/order/auto-server/processing`;
        if (option?.autoServer === "unipin") {
          // Pull one code per combo unit × quantity; shortage → reinsert the
          // pulled codes and keep the order pending (mirrors orderDynamic).
          const ucs = [];
          let totalUnipinToOrder = 0;
          for (const item of option?.combo || []) {
            if (item?.quantity > 0) {
              totalUnipinToOrder += item?.quantity * quantity;
              for (let i = 0; i < item?.quantity * quantity; i++) {
                // Guard: rows without a real uc are skipped — {uc: undefined}
                // matches ANY doc missing the field and would delete a random
                // code (review-hardened, same as orderDynamic).
                if (!item?.uc) break;
                const uc = await unipinCollection.findOneAndDelete({
                  uc: item.uc,
                });
                if (!uc) break;
                ucs.push(uc);
              }
            }
          }
          if (ucs.length !== totalUnipinToOrder) {
            if (ucs.length) {
              await unipinCollection.insertMany(ucs);
            }
          } else {
            const ucsArr = ucs.map((uc) => uc?.code);
            await orderCollection.updateOne(
              { _id: new ObjectId(result.insertedId) },
              { $set: { codes: ucsArr } }
            );
            while (ucsArr.length) {
              const ucsToClaim = ucsArr.splice(0, 5);
              await axiosAuto.post("/topup", {
                orderid: result?.insertedId,
                playerid: info?.uid,
                code: ucsToClaim.join(","),
                url: callbackUrl,
              });
            }
          }
        } else {
          // my / indo / sg — shell packages path
          const shellPackages = [];
          const autoCombo = option?.combo?.reduce((acc, item) => {
            if (item?.quantity > 0) {
              acc.push({
                name: item?.name,
                package: item?.package,
                quantity: item?.quantity * quantity,
              });
              for (let i = 0; i < item?.quantity * quantity || 0; i++) {
                shellPackages.push(item?.package);
              }
            }
            return acc;
          }, []);
          // All combo quantities 0 → keep the order pending, skip the API call
          if (autoCombo.length && shellPackages.length) {
            const autoOrderData = {
              orderid: result?.insertedId,
              playerid: info?.uid,
              code:
                option?.autoServer === "my"
                  ? "shell"
                  : option?.autoServer === "sg"
                  ? "sgshell"
                  : "indo",
              url: callbackUrl,
              pacakge: shellPackages.join(","),
              username:
                option?.autoServer === "sg"
                  ? process.env.SHELL_SG_USERNAME
                  : process.env.SHELL_USERNAME,
              password:
                option?.autoServer === "sg"
                  ? process.env.SHELL_SG_PASSWORD
                  : process.env.SHELL_PASSWORD,
              autocode:
                option?.autoServer === "sg"
                  ? process.env.SHELL_SG_AUTH_KEY
                  : process.env.SHELL_AUTH_KEY,
            };
            const isLessIsMore = shellPackages.includes("lessismore");
            if (isLessIsMore) {
              autoOrderData.code = "lessismore";
              autoOrderData.mode = "single";
              delete autoOrderData.pacakge;
            }
            try {
              await axiosAuto.post("/topup", autoOrderData);
            } catch (err) {
              console.error("orderSpecialOffer auto: ", err.message);
            }
          }
        }
      }
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
      status: {$nin: ["complete", "cancelled"]},
    });
    const result = await orderCollection
      .find({ status: {$nin: ["complete", "cancelled"]} }, { sort: { updateTime: -1 } })
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

    // Settle a coin-bonus record for this status change.
    // `status` on the coinHistory doc is the source of truth for whether the
    // coins were actually credited, which makes this safe to run more than once:
    // completing an already-credited bonus does not credit it twice, and
    // cancelling a credited bonus (item-listing orders credit at purchase time)
    // takes the coins back instead of leaving them with the user.
    const settleCoinBonus = async (bonusId) => {
      const coinHistory = await coinHistoryCollection.findOne({
        _id: new ObjectId(bonusId),
      });
      if (!coinHistory) return;
      const alreadyCredited = coinHistory.status === "success";
      if (newStatus === "complete" && !alreadyCredited) {
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
        if (alreadyCredited) {
          await userCollection.updateOne(
            { email: coinHistory.email },
            { $inc: { coins: -coinHistory.amount } }
          );
        }
        await coinHistoryCollection.updateOne(
          { _id: coinHistory._id },
          { $set: { status: "cancel" } }
        );
      }
    };

    if (order.coinBonusID) {
      await settleCoinBonus(order.coinBonusID);
    }
    if (order.referHistoryId) {
      await settleCoinBonus(order.referHistoryId);
    }
    // Guard on the previous status so cancelling an already-cancelled order
    // does not refund the customer a second time.
    const isNewlyCancelled =
      newStatus === "cancelled" && order?.status !== "cancelled";

    if (isNewlyCancelled && order?.type === "balance") {
      await userCollection.updateOne(
        { email: order.email },
        { $inc: { balance: order.price, spent: -order.price } }
      );
    }
    // Cancelling a listing purchase returns the unique item to the shop, but
    // hidden rather than immediately back on sale: the previous buyer still has
    // the delivered credentials in their order, so an admin must rotate them and
    // re-activate the item deliberately.
    if (
      isNewlyCancelled &&
      order?.orderType === "itemListing" &&
      order?.itemId
    ) {
      await serviceItemCollection.updateOne(
        { _id: new ObjectId(order.itemId) },
        {
          $set: { isSold: false, isActive: false },
          $unset: { soldTo: 1, soldAt: 1 },
        }
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
    const {status, orderid, nickname, content, batch} = req.body;

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

    if(batch){
      contentDoc.push(...batch);
    }else if(content?.batch && Array.isArray(content?.batch)){
      contentDoc.push(...content?.batch);
    }else {
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
  orderItemListing,
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
