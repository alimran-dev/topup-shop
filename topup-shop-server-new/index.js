const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(
  cors({
    origin: [
      "https://mezbashop.com",
      "https://www.mezbashop.com",
      "https://demo.mezbashop.com",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// custom middleware
const verifyToken = (req, res, next) => {
  const { "access-token": token } = req.cookies;
  if (!token) {
    return res.status(401).send({ message: "not authorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res
        .cookie("access-token", "", {
          httpOnly: true,
          maxAge: 0,
          secure: process.env.PROJECT_ENV !== "development",
          sameSite:
            process.env.PROJECT_ENV !== "development" ? "none" : "strict",
          domain:
            process.env.PROJECT_ENV !== "development"
              ? ".mezbashop.com"
              : "localhost",
        })
        .status(401)
        .send({ message: "unauthorized" });
    }
    req.user = decoded;
    next();
  });
};
const verifyAdmin = (req, res, next) => {
  const { "access-token": token } = req.cookies;
  if (!token) {
    return res.status(401).send({ message: "not authorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res
        .cookie("access-token", "", {
          httpOnly: true,
          maxAge: 0,
          secure: process.env.PROJECT_ENV !== "development",
          sameSite:
            process.env.PROJECT_ENV !== "development" ? "none" : "strict",
          domain:
            process.env.PROJECT_ENV !== "development"
              ? ".mezbashop.com"
              : "localhost",
        })
        .status(401)
        .send({ message: "unauthorized" });
    }
    if (decoded.role !== "admin") {
      return res
        .cookie("access-token", "", {
          httpOnly: true,
          maxAge: 0,
          secure: process.env.PROJECT_ENV !== "development",
          sameSite:
            process.env.PROJECT_ENV !== "development" ? "none" : "strict",
          domain:
            process.env.PROJECT_ENV !== "development"
              ? ".mezbashop.com"
              : "localhost",
        })
        .status(401)
        .send({ message: "unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

app.get("/", (req, res) => {
  res.send("game shop server is running");
});

let dbName;
if (process.env.PROJECT_ENV === "production") {
  dbName = "mezbaGamingDB";
} else {
  dbName = "topupDB";
}

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tklaef2.mongodb.net/?retryWrites=true&w=majority`;
let uri;
if (process.env.PROJECT_ENV !== "development") {
  uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@127.0.0.1:27017/${dbName}`;
} else {
  uri = `mongodb://127.0.0.1:27017/`;
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
});

const database =
  process.env.PROJECT_ENV === "production"
    ? client.db("mezbaGamingDB")
    : client.db("topupDB");
const userCollection = database.collection("users");
const orderCollection = database.collection("orders");
const unipinCollection = database.collection("unipins");
const idcodeCollection = database.collection("idcodes");
const weeklyMonthlyCollection = database.collection("weeklyMonthly");
const shellCollection = database.collection("shells");
const specialOfferCollection = database.collection("specialOffer");
const airdropCollection = database.collection("airdrops");
const lessIsMoreCollection = database.collection("lessIsMore");
const paymentMethodCollection = database.collection("paymentMethods");
const paymentMethodSummaryCollection = database.collection(
  "paymentMethodSummary"
);
const noticeCollection = database.collection("notices");
const transactionCollection = database.collection("transactions");
const bkashTrxCollection = database.collection("bkashTrx");
const nagadTrxCollection = database.collection("nagadTrx");
const blockedTrxCollection = database.collection("blockedTrx");
const deviceIdCollections = database.collection("deviceIDs");
const addBalanceOfferCollections = database.collection("addBalanceOffer");

const connectToDB = async () => {
  try {
    await client.connect();
    console.log("Connected to DB");
  } catch (err) {
    console.error("Error connecting to database", err);
  }
};
async function run() {
  try {
    // await client.connect();
    // auth related api
    // /auth/isAdmin
    app.get("/isAdmin", verifyToken, async (req, res) => {
      try {
        const { email, role } = req.user || {};
        const userInDb = await userCollection.findOne({ email: email });
        if (!userInDb) {
          return res
            .clearCookie("access-token", {
              maxAge: 0,
              secure: process.env.PROJECT_ENV !== "development",
              sameSite:
                process.env.PROJECT_ENV !== "development" ? "none" : "strict",
            })
            .status(401)
            .send({ message: "unauthorized" });
        } else if (role !== "admin") {
          return res.send({ isAdmin: false });
        } else if (role === "admin") {
          res.send({ isAdmin: true });
        } else {
          res.send({ isAdmin: false });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /auth/jwt
    app.post("/jwt", async (req, res) => {
      try {
        const { email } = req.body;
        console.log(email);
        const userInDb = await userCollection.findOne({ email: email });
        console.log(userInDb);
        if (!userInDb) {
          return res.status(401).send({ error: "Unauthorized" });
        }
        const user = { email, role: userInDb.role };
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "31d",
        });
        res.cookie("access-token", token, {
          httpOnly: true,
          secure: process.env.PROJECT_ENV !== "development",
          sameSite:
            process.env.PROJECT_ENV !== "development" ? "none" : "strict",
          maxAge: 1000 * 60 * 60 * 24 * 30,
          domain:
            process.env.PROJECT_ENV !== "development"
              ? ".mezbashop.com"
              : "localhost",
        });
        res.send({ success: true });
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /auth/logout
    app.post("/logout", verifyToken, (req, res) => {
      try {
        const user = req.body;
        console.log(user);
        res.cookie("access-token", "", {
          httpOnly: true,
          maxAge: 0,
          secure: process.env.PROJECT_ENV !== "development",
          sameSite:
            process.env.PROJECT_ENV !== "development" ? "none" : "strict",
          domain:
            process.env.PROJECT_ENV !== "development"
              ? ".mezbashop.com"
              : "localhost",
        });
        res.send({ success: true });
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // user related api
    // /user/profile
    app.get("/user", verifyToken, async (req, res) => {
      try {
        const email = req.user.email;
        const filter = { email };
        console.log("user email in cookie: ", email);
        const result = await userCollection.findOne(filter);
        if (result?.isBanned) {
          return res
            .cookie("access-token", "", {
              httpOnly: true,
              maxAge: 0,
              secure: process.env.PROJECT_ENV !== "development",
              sameSite:
                process.env.PROJECT_ENV !== "development" ? "none" : "strict",
              domain:
                process.env.PROJECT_ENV !== "development"
                  ? ".mezbashop.com"
                  : "localhost",
            })
            .status(401)
            .send({ error: "User Blocked" });
        }
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
        if (result) {
          result.spent = totalSpent;
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /user/new
    app.post("/users", async (req, res) => {
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
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /user/update
    app.patch("/updateUser", verifyToken, async (req, res) => {
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
          res.send(user);
        } else {
          res.status(501).send({ error: "Internal server Error" });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // order related api
    // /order/all
    app.get("/orders", verifyToken, async (req, res) => {
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
          .limit(parseInt(limitInt))
          .toArray();
        res.send({ orders: result, total: totalOrders });
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /order/new/auto/unipin
    app.post("/purchase/unipin", verifyToken, async (req, res) => {
      try {
        const { id, email, quantity } = req.body;
        const orderTime = new Date();
        // const email = req.query?.email;
        // const id = req.query?.id;
        // const quantity = req.query?.quantity;
        if (!id || !email || !quantity) {
          return res.status(400).send({ error: "Item not found" });
        }
        const emailInToken = req.user?.email;
        if (email !== emailInToken) {
          return res
            .cookie("access-token", "", {
              httpOnly: true,
              maxAge: 0,
              secure: process.env.PROJECT_ENV !== "development",
              sameSite:
                process.env.PROJECT_ENV !== "development" ? "none" : "strict",
              domain:
                process.env.PROJECT_ENV !== "development"
                  ? ".mezbashop.com"
                  : "localhost",
            })
            .status(401)
            .send({ message: "unauthorized" });
        }
        const filter = { _id: new ObjectId(id) };
        const option = await unipinCollection.findOne(filter);
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
          return res
            .status(400)
            .send({ error: "You don't have enough balance" });
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
          await unipinCollection.updateOne(filter, {
            $pull: { codes: { $in: takenCodes } },
          });
          const ordersCount = await orderCollection.countDocuments();
          const order = {
            optionID: new ObjectId(id),
            orderID: ordersCount + 1000,
            email: email,
            category: "unipin",
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
          res
            .status(201)
            .send({ orderID: result.insertedId, price: orderPrice });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /order/new/manual/idcode
    app.post("/purchase/idcode", verifyToken, async (req, res) => {
      try {
        const { id, email, uid } = req.body;
        const orderTime = new Date();
        if (!id || !email || !uid) {
          return res.status(400).send({ error: "Item Not Found" });
        }
        const emailInToken = req.user?.email;
        if (email !== emailInToken) {
          return res
            .cookie("access-token", "", {
              httpOnly: true,
              maxAge: 0,
              secure: process.env.PROJECT_ENV !== "development",
              sameSite:
                process.env.PROJECT_ENV !== "development" ? "none" : "strict",
              domain:
                process.env.PROJECT_ENV !== "development"
                  ? ".mezbashop.com"
                  : "localhost",
            })
            .status(401)
            .send({ message: "unauthorized" });
        }
        const filter = { _id: new ObjectId(id) };
        const option = await idcodeCollection.findOne(filter);
        if (!option) {
          return res.status(400).send({ error: "Item Not Found" });
        }
        const orderPrice = option.price;
        const user = await userCollection.findOne({ email: email });
        if (!user) {
          return res.status(401).send({ error: "User Not Found" });
        } else if (user.balance < orderPrice) {
          return res
            .status(400)
            .send({ error: "You don't have enough balance" });
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
            category: "idcode",
            name: `${option.name} (UID: ${uid})`,
            price: orderPrice,
            orderTime: orderTime,
            updateTime: new Date(),
            status: "pending",
            feedback: "",
          };
          console.log(order);
          const result = await orderCollection.insertOne(order);
          res
            .status(201)
            .send({ orderID: result.insertedId, price: orderPrice });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // order/new/manual/weekly
    app.post("/purchase/weekly", verifyToken, async (req, res) => {
      try {
        const { id, email, uid } = req.body;
        const orderTime = new Date();
        if (!id || !email || !uid) {
          return res.status(400).send({ error: "Item Not Found" });
        }
        const emailInToken = req.user?.email;
        if (email !== emailInToken) {
          return res
            .cookie("access-token", "", {
              httpOnly: true,
              maxAge: 0,
              secure: process.env.PROJECT_ENV !== "development",
              sameSite:
                process.env.PROJECT_ENV !== "development" ? "none" : "strict",
              domain:
                process.env.PROJECT_ENV !== "development"
                  ? ".mezbashop.com"
                  : "localhost",
            })
            .status(401)
            .send({ message: "unauthorized" });
        }
        const filter = { _id: new ObjectId(id) };
        const option = await weeklyMonthlyCollection.findOne(filter);
        if (!option) {
          return res.status(400).send({ error: "Item Not Found" });
        }
        const orderPrice = option.price;
        const user = await userCollection.findOne({ email: email });
        if (!user) {
          return res.status(401).send({ error: "User Not Found" });
        } else if (user.balance < orderPrice) {
          return res
            .status(400)
            .send({ error: "You don't have enough balance" });
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
            category: "weekly & monthly",
            name: `${option.name} (UID: ${uid})`,
            price: orderPrice,
            orderTime: orderTime,
            updateTime: new Date(),
            status: "pending",
            feedback: "",
          };
          console.log(order);
          const result = await orderCollection.insertOne(order);
          res
            .status(201)
            .send({ orderID: result.insertedId, price: orderPrice });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /order/new/auto/shell
    app.post("/purchase/shell", verifyToken, async (req, res) => {
      try {
        const { id, email, quantity } = req.body;
        const orderTime = new Date();
        // const email = req.query?.email;
        // const id = req.query?.id;
        // const quantity = req.query?.quantity;
        if (!id || !email || !quantity) {
          return res.status(400).send({ error: "Item not found" });
        }
        const emailInToken = req.user?.email;
        if (email !== emailInToken) {
          return res
            .cookie("access-token", "", {
              httpOnly: true,
              maxAge: 0,
              secure: process.env.PROJECT_ENV !== "development",
              sameSite:
                process.env.PROJECT_ENV !== "development" ? "none" : "strict",
              domain:
                process.env.PROJECT_ENV !== "development"
                  ? ".mezbashop.com"
                  : "localhost",
            })
            .status(401)
            .send({ message: "unauthorized" });
        }
        const filter = { _id: new ObjectId(id) };
        const option = await shellCollection.findOne(filter);
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
          return res
            .status(400)
            .send({ error: "You don't have enough balance" });
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
          await shellCollection.updateOne(filter, {
            $pull: { codes: { $in: takenCodes } },
          });
          const ordersCount = await orderCollection.countDocuments();
          const order = {
            optionID: new ObjectId(id),
            orderID: ordersCount + 1000,
            email: email,
            category: "shell",
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
          res
            .status(201)
            .send({ orderID: result.insertedId, price: orderPrice });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /order/new/manual/airdrop
    app.post("/purchase/airdrop", verifyToken, async (req, res) => {
      try {
        const { id, email, uid } = req.body;
        const orderTime = new Date();
        if (!id || !email || !uid) {
          return res.status(400).send({ error: "Item Not Found" });
        }
        const emailInToken = req.user?.email;
        if (email !== emailInToken) {
          return res
            .cookie("access-token", "", {
              httpOnly: true,
              maxAge: 0,
              secure: process.env.PROJECT_ENV !== "development",
              sameSite:
                process.env.PROJECT_ENV !== "development" ? "none" : "strict",
              domain:
                process.env.PROJECT_ENV !== "development"
                  ? ".mezbashop.com"
                  : "localhost",
            })
            .status(401)
            .send({ message: "unauthorized" });
        }
        const filter = { _id: new ObjectId(id) };
        const option = await airdropCollection.findOne(filter);
        if (!option) {
          return res.status(400).send({ error: "Item Not Found" });
        }
        const orderPrice = option.price;
        const user = await userCollection.findOne({ email: email });
        if (!user) {
          return res.status(401).send({ error: "User Not Found" });
        } else if (user.balance < orderPrice) {
          return res
            .status(400)
            .send({ error: "You don't have enough balance" });
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
            category: "airdrop",
            name: `${option.name} (UID: ${uid})`,
            price: orderPrice,
            orderTime: orderTime,
            updateTime: new Date(),
            status: "pending",
            feedback: "",
          };
          console.log(order);
          const result = await orderCollection.insertOne(order);
          res
            .status(201)
            .send({ orderID: result.insertedId, price: orderPrice });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /order/new/manual/lessIsMore
    app.post("/purchase/lessIsMore", verifyToken, async (req, res) => {
      try {
        const { id, email, uid } = req.body;
        const orderTime = new Date();
        if (!id || !email || !uid) {
          return res.status(400).send({ error: "Item Not Found" });
        }
        const emailInToken = req.user?.email;
        if (email !== emailInToken) {
          return res
            .cookie("access-token", "", {
              httpOnly: true,
              maxAge: 0,
              secure: process.env.PROJECT_ENV !== "development",
              sameSite:
                process.env.PROJECT_ENV !== "development" ? "none" : "strict",
              domain:
                process.env.PROJECT_ENV !== "development"
                  ? ".mezbashop.com"
                  : "localhost",
            })
            .status(401)
            .send({ message: "unauthorized" });
        }
        const filter = { _id: new ObjectId(id) };
        const option = await lessIsMoreCollection.findOne(filter);
        if (!option) {
          return res.status(400).send({ error: "Item Not Found" });
        }
        const orderPrice = option.price;
        const user = await userCollection.findOne({ email: email });
        if (!user) {
          return res.status(401).send({ error: "User Not Found" });
        } else if (user.balance < orderPrice) {
          return res
            .status(400)
            .send({ error: "You don't have enough balance" });
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
            category: "lessIsMore",
            name: `${option.name} (UID: ${uid})`,
            price: orderPrice,
            orderTime: orderTime,
            updateTime: new Date(),
            status: "pending",
            feedback: "",
          };
          console.log(order);
          const result = await orderCollection.insertOne(order);
          res
            .status(201)
            .send({ orderID: result.insertedId, price: orderPrice });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });


    // option and code admin api
    // /option/all
    app.get("/options", async (req, res) => {
      try {
        const { category } = req.query;
        console.log(category);
        const filterOption = {
          sort: { uc: 1 },
          projection: {
            name: 1,
            price: 1,
            uc: 1,
            category: 1,
            stock: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$category", "idcode"] },
                    { $eq: ["$category", "weekly"] },
                    { $eq: ["$category", "airdrop"] },
                    { $eq: ["$category", "lessIsMore"] },
                  ],
                },
                then: "$stock",
                else: {
                  $cond: {
                    if: { $lt: [{ $size: "$codes" }, 30] },
                    then: { $size: "$codes" },
                    else: null,
                  },
                },
              },
            },
          },
        };
        let result;
        if (category === "unipin") {
          result = await unipinCollection.find({}, filterOption).toArray();
        } else if (category === "idcode") {
          result = await idcodeCollection.find({}, filterOption).toArray();
        } else if (category === "weekly-monthly") {
          result = await weeklyMonthlyCollection
            .find({}, filterOption)
            .toArray();
        } else if (category === "shell") {
          result = await shellCollection.find({}, filterOption).toArray();
        } else if (category === "airdrop") {
          result = await airdropCollection.find({}, filterOption).toArray();
        } else if (category === "lessIsMore") {
          result = await lessIsMoreCollection.find({}, filterOption).toArray();
        } else {
          return res.status(400).send({ error: "Bad Request" });
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /option
    app.get("/option", async (req, res) => {
      try {
        const { category, id } = req.query;
        const options = {
          $projection: {
            name: 1,
            price: 1,
            uc: 1,
            stock: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$category", "idcode"] },
                    { $eq: ["$category", "weekly"] },
                    { $eq: ["$category", "airdrop"] },
                    { $eq: ["$category", "lessIsMore"] },
                  ],
                },
                then: "$stock",
                else: {
                  $cond: {
                    if: { $lt: [{ $size: "$codes" }, 30] },
                    then: { $size: "$codes" },
                    else: null,
                  },
                },
              },
            },
          },
        };
        let result;
        if (category === "unipin") {
          result = await unipinCollection.findOne(
            { _id: new ObjectId(id) },
            options
          );
        } else if (category === "idcode") {
          result = await idcodeCollection.findOne(
            { _id: new ObjectId(id) },
            options
          );
        } else if (category === "weekly-monthly") {
          result = await weeklyMonthlyCollection.findOne(
            { _id: new ObjectId(id) },
            options
          );
        } else if (category === "shell") {
          result = await shellCollection.findOne(
            { _id: new ObjectId(id) },
            options
          );
        } else if (category === "airdrop") {
          result = await airdropCollection.findOne(
            { _id: new ObjectId(id) },
            options
          );
        } else if (category === "lessIsMore") {
          result = await lessIsMoreCollection.findOne(
            { _id: new ObjectId(id) },
            options
          );
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /option/admin/add/:category
    app.post("/addOption/:category", verifyAdmin, async (req, res) => {
      try {
        const category = req.params.category;
        const { name, price, uc } = req.body;
        const option = { category, name, price, uc, codes: [] };
        const optionManual = { category, name, price, uc, stock: true };
        let result;
        if (category === "unipin") {
          const isAvailable = await unipinCollection.findOne({ uc: uc });
          if (isAvailable) {
            return res.send({ message: "Option available for this UC." });
          } else {
            result = await unipinCollection.insertOne(option);
          }
        } else if (category === "idcode") {
          const isAvailable = await idcodeCollection.findOne({ uc: uc });
          if (isAvailable) {
            return res.send({ message: "Option available for this UC." });
          } else {
            result = await idcodeCollection.insertOne(optionManual);
          }
        } else if (category === "weekly") {
          const isAvailable = await weeklyMonthlyCollection.findOne({ uc: uc });
          if (isAvailable) {
            return res.send({ message: "Option available for this UC." });
          } else {
            result = await weeklyMonthlyCollection.insertOne(optionManual);
          }
        } else if (category === "shell") {
          const isAvailable = await shellCollection.findOne({ uc: uc });
          if (isAvailable) {
            return res.send({ message: "Option available for this UC." });
          } else {
            result = await shellCollection.insertOne(option);
          }
        } else if (category === "airdrop") {
          const isAvailable = await airdropCollection.findOne({ uc: uc });
          if (isAvailable) {
            return res.send({ message: "Option available for this UC." });
          } else {
            result = await airdropCollection.insertOne(optionManual);
          }
        } else if (category === "lessIsMore") {
          const isAvailable = await lessIsMoreCollection.findOne({ uc: uc });
          if (isAvailable) {
            return res.send({ message: "Option available for this UC." });
          } else {
            result = await lessIsMoreCollection.insertOne(optionManual);
          }
        } else {
          return res.send({ message: "category not matched" });
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /code/admin/add/:category/:id?
    app.post("/addCodes/:category/:id?", verifyAdmin, async (req, res) => {
      try {
        const category = req.params.category;
        const id = req.params.id;
        const codesArray = req.body;
        console.log(codesArray, id);
        if (category === "unipin") {
          codesArray.forEach(async (item) => {
            const filter = { uc: item.uc };
            const result = await unipinCollection.updateOne(filter, {
              $addToSet: { codes: { $each: item.codes } },
            });
            console.log(result);
          });
        } else if (category === "shell") {
          const filter = { _id: new ObjectId(id) };
          const result = await shellCollection.updateOne(filter, {
            $addToSet: { codes: { $each: codesArray } },
          });
          console.log(result);
        }
        res.send({ message: "Updated successfully" });
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /option/admin/update
    app.patch("/admin/update/option", verifyAdmin, async (req, res) => {
      try {
        const { id, category, name, price } = req.body || {};
        const filter = { _id: new ObjectId(id) };
        const updatedOption = {
          $set: {
            name: name,
            price: parseInt(price),
          },
        };
        let result;
        if (category === "unipin") {
          result = await unipinCollection.updateOne(filter, updatedOption);
        } else if (category === "idcode") {
          result = await idcodeCollection.updateOne(filter, updatedOption);
        } else if (category === "weekly-monthly") {
          result = await weeklyMonthlyCollection.updateOne(
            filter,
            updatedOption
          );
        } else if (category === "shell") {
          result = await shellCollection.updateOne(filter, updatedOption);
        } else if (category === "airdrop") {
          result = await airdropCollection.updateOne(filter, updatedOption);
        } else if (category === "lessIsMore") {
          result = await lessIsMoreCollection.updateOne(filter, updatedOption);
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /option/admin/stock
    app.patch("/admin/option/stock", verifyAdmin, async (req, res) => {
      try {
        const { id, category, stock } = req.body || {};
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            stock: stock,
          },
        };
        let result;
        if (category === "idcode") {
          result = await idcodeCollection.updateOne(filter, updatedDoc);
        } else if (category === "weekly-monthly") {
          result = await weeklyMonthlyCollection.updateOne(filter, updatedDoc);
        } else if (category === "airdrop") {
          result = await airdropCollection.updateOne(filter, updatedDoc);
        } else if (category === "lessIsMore") {
          result = await lessIsMoreCollection.updateOne(filter, updatedDoc);
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /option/admin/delete
    app.delete("/admin/delete/option", verifyAdmin, async (req, res) => {
      try {
        const { category, id } = req.query || {};
        const filter = { _id: new ObjectId(id) };
        let result;
        if (category === "unipin") {
          result = await unipinCollection.deleteOne(filter);
        } else if (category === "idcode") {
          result = await idcodeCollection.deleteOne(filter);
        } else if (category === "weekly-monthly") {
          result = await weeklyMonthlyCollection.deleteOne(filter);
        } else if (category === "shell") {
          result = await shellCollection.deleteOne(filter);
        } else if (category === "airdrop") {
          result = await airdropCollection.deleteOne(filter);
        } else if (category === "lessIsMore") {
          result = await lessIsMoreCollection.deleteOne(filter);
        }
        console.log(category, id, result);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });


    // special offer related api
    // /special/offers/:server
    app.get("/offers/:server", async (req, res) => {
      try {
        const server = req.params.server;
        console.log(server);
        if (server === "indonesia") {
          const result = await specialOfferCollection
            .find({ server: "indonesia" })
            .sort({ inStock: -1, price: 1 })
            .toArray();
          res.send(result);
        } else if (server === "all") {
          const result = await specialOfferCollection
            .find({ server: "all" })
            .sort({ inStock: -1, price: 1 })
            .toArray();
          res.send(result);
        } else res.status(400).send({ message: "Wrong query" });
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /special/offer/:id
    app.get("/offer/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await specialOfferCollection.findOne(filter);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /special/offer/update
    app.patch("/offer/update", verifyAdmin, async (req, res) => {
      try {
        const { id, name, price, description } = req.body;
        const filter = { _id: new ObjectId(id) };
        const option = {
          $set: {
            name: name,
            price: parseInt(price),
            description: description,
          },
        };
        const result = await specialOfferCollection.updateOne(filter, option);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /special/offer/stock
    app.patch("/offers/updateStock", verifyAdmin, async (req, res) => {
      try {
        const { id, inStock } = req.body;
        const filter = { _id: new ObjectId(id) };
        const option = {
          $set: {
            inStock: inStock,
          },
        };
        const result = await specialOfferCollection.updateOne(filter, option);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /special/offer/new
    app.post("/offer", verifyAdmin, async (req, res) => {
      try {
        const { name, server, price, description } = req.body;
        const option = { name, server, price, description, inStock: true };
        const result = await specialOfferCollection.insertOne(option);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /special/offer/delete
    app.delete("/offer/delete", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.query;
        const filter = { _id: new ObjectId(id) };
        const result = await specialOfferCollection.deleteOne(filter);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });


    // order related admin api
    // /order/admin/all
    app.get("/admin/orders", verifyAdmin, async (req, res) => {
      try {
        const { page, limit, search } = req.query;
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);
        console.log(pageInt, limitInt);
        const totalOrders = await orderCollection.countDocuments();
        if (search) {
          const result = await orderCollection
            .find(
              { email: { $regex: new RegExp(search, "i") } },
              { sort: { updateTime: -1 } }
            )
            .toArray();
          res.send({ orders: result, totalOrders: result.length });
        } else {
          const result = await orderCollection
            .find({}, { sort: { updateTime: -1 } })
            .skip((pageInt - 1) * limitInt)
            .limit(limitInt)
            .toArray();
          res.send({ orders: result, totalOrders });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /order/admin/pending
    app.get("/admin/orders/pending", verifyAdmin, async (req, res) => {
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
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /order/admin/processing
    app.patch("/admin/orders/processing", verifyAdmin, async (req, res) => {
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
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    
    // user related admin api
    // /user/admin/all
    app.get("/admin/users", verifyAdmin, async (req, res) => {
      try {
        const { page, limit, search } = req.query;
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);
        console.log(pageInt, limitInt);
        const totalUsers = await userCollection.countDocuments();
        if (search) {
          const result = await userCollection
            .find({ email: { $regex: new RegExp(search, "i") } })
            .toArray();
          res.send({ users: result, totalUsers: result.length });
        } else {
          const result = await userCollection
            .find({})
            .skip((pageInt - 1) * limitInt)
            .limit(limitInt)
            .toArray();
          res.send({ users: result, totalUsers });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /user/admin/status
    app.patch("/admin/user/status", verifyAdmin, async (req, res) => {
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
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /user/admin/balance
    app.patch("/admin/user/balance", verifyAdmin, async (req, res) => {
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
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // admin dashboard api
    // /dashboard/admin
    app.get("/admin/dashboard", verifyAdmin, async (req, res) => {
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
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });








    // payment method related api
    // /payment/methods
    app.get("/paymentMethods", verifyToken, async (req, res) => {
      try {
        const { role } = req.user;
        let filter = {};
        if (role === "user") {
          filter = { status: "active" };
        }
        const result = await paymentMethodCollection.find(filter).toArray();
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /payment/method/admin/add
    app.post("/paymentMethods/add", verifyAdmin, async (req, res) => {
      try {
        const { provider, category, bonus, fee, number, status } = req.body;
        const newMethod = {
          provider,
          category,
          bonus: parseFloat(bonus),
          fee: parseFloat(fee),
          number,
          status,
        };
        const result = await paymentMethodCollection.insertOne(newMethod);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /payment/method/admin/update
    app.patch("/paymentMethods/update", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.query;
        const { bonus, fee, number, status } = req.body;
        const updatedMethod = {
          $set: {
            bonus: parseFloat(bonus),
            fee: parseFloat(fee),
            number,
            status,
          },
        };
        const filter = { _id: new ObjectId(id) };
        const result = await paymentMethodCollection.updateOne(
          filter,
          updatedMethod,
          { upsert: true }
        );
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /payment/method/admin/delete
    app.delete("/paymentMethods/delete", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.query;
        const filter = { _id: new ObjectId(id) };
        const result = await paymentMethodCollection.deleteOne(filter);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // payment method balance related api
    // /payment/method/admin/balance/summary
    app.get("/admin/paymentMethod/summary", verifyAdmin, async (req, res) => {
      try {
        const result = await paymentMethodSummaryCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /payment/method/admin/balance/reset
    app.patch("/admin/paymentMethod/reset", verifyAdmin, async (req, res) => {
      try {
        const { method, id } = req.query;
        let doc;
        if (method === "bkash") {
          doc = { bkash: 0 };
        } else if (method === "nagad") {
          doc = { nagad: 0 };
        }
        const updatedDoc = {
          $set: doc,
        };
        const filter = { _id: new ObjectId(id) };
        const result = await paymentMethodSummaryCollection.updateOne(
          filter,
          updatedDoc,
          { upsert: true }
        );
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // notice related api
    // /notice
    app.get("/notice", async (req, res) => {
      try {
        const result = await noticeCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /notice/admin/update
    app.patch("/notice/update", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.query;
        const doc = req.body;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: doc,
        };
        const result = await noticeCollection.updateOne(filter, updatedDoc, {
          upsert: true,
        });
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // add balance offer related api
    // /balance/offer
    app.get("/addBalance/offer", async (req, res) => {
      try {
        const result = await addBalanceOfferCollections.find().toArray();
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /balance/admin/offer/update
    app.patch("/addBalance/offer/update", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.query;
        const doc = req.body;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: doc,
        };
        const result = await addBalanceOfferCollections.updateOne(
          filter,
          updatedDoc,
          {
            upsert: true,
          }
        );
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // add balance related api
    // /balance/add
    app.post("/addBalance", verifyToken, async (req, res) => {
      try {
        const { amount, email, id } = req.body;
        if (amount >= 5000) {
          return res.send({
            message: `একসাথে সর্বোচ্চ ৪৯৯৯ টাকা অ্যাড করতে পারবেন।`,
          });
        }
        const pendingCount = await transactionCollection.countDocuments({
          email,
          status: "pending",
        });
        console.log(pendingCount);
        if (pendingCount > 0) {
          const transaction = await transactionCollection.findOne({
            email,
            status: "pending",
          });
          console.log(transaction);
          const timeNow = new Date();
          const timeDiff = timeNow.getTime() - transaction.time.getTime();
          let timeDiffSec = timeDiff / 1000;
          if (timeDiffSec < 5) {
            return res.send({
              message: `আপনার pending ট্রানজেকশন আছে। সেটি complete করুন অথবা আরও ${parseInt(
                5 - timeDiffSec
              )} সেকেন্ড অপেক্ষা করুন।`,
            });
          } else {
            await transactionCollection.deleteOne({ email, status: "pending" });
          }
        }
        const method = await paymentMethodCollection.findOne({
          _id: new ObjectId(id),
        });
        const { provider, category, bonus, fee, number } = method || {};
        const transaction = {
          method: provider + " " + category,
          amount,
          bonus,
          fee,
          toPay: Math.ceil(amount + (amount * fee) / 100),
          willAdd: parseFloat((amount + (amount * bonus) / 100).toFixed(2)),
          number,
          email,
          attempt: 0,
          trxID: "",
          time: new Date(),
          status: "pending",
        };
        const result = await transactionCollection.insertOne(transaction);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /balance/add/check
    app.patch("/addBalance/check", verifyToken, async (req, res) => {
      try {
        const { email } = req.user;
        // const email = "test@gmail.com";
        const { id, trxID } = req.body;
        const invoice = await transactionCollection.findOne({
          _id: new ObjectId(id),
        });
        let trxSms = null;
        if (
          !invoice ||
          email !== invoice.email ||
          invoice?.status === "completed"
        ) {
          return res.status(403).send({
            success: false,
            isBanned: false,
            attempt: invoice?.attempt,
            message: "forbidden",
          });
        }
        if (invoice.attempt > 4) {
          const { modifiedCount } = await userCollection.updateOne(
            { email: email },
            { $set: { isBanned: true } }
          );
          if (modifiedCount) {
            return res.send({
              success: false,
              isBanned: true,
              attempt: invoice.attempt,
              message: "You have reached the limit to check.",
            });
          }
        }
        await transactionCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { attempt: 1 }, $set: { trxID } }
        );
        const provider = invoice?.method.split(" ")[0];
        const category = invoice?.method.split(" ")[1];
        const blockTrx = await blockedTrxCollection
          .find({ trxID: trxID })
          .toArray();
        let blockTrxFind = [];
        blockTrxFind = blockTrx.filter(
          (trxObj) =>
            trxObj.provider === provider && trxObj.category === category
        );
        if (blockTrxFind.length) {
          return res.send({
            success: false,
            isBanned: false,
            attempt: invoice.attempt + 1,
            message: "এই ট্রানজেকশন আইডি ব্যবহার করা হয়েছে",
          });
        }
        if (provider === "bkash") {
          trxSms = await bkashTrxCollection.findOne({ trxID: trxID });
        } else if (provider === "nagad") {
          trxSms = await nagadTrxCollection.findOne({ trxID: trxID });
        }
        if (trxSms) {
          const providerInSms = trxSms.provider;
          const categoryInSms = trxSms.category;
          const amount = trxSms.amount;
          if (
            provider === providerInSms &&
            category === categoryInSms &&
            invoice?.toPay === amount
          ) {
            let delRes;
            if (provider === "bkash") {
              delRes = await bkashTrxCollection.deleteOne({
                trxID: trxID,
              });
            } else if (provider === "nagad") {
              delRes = await nagadTrxCollection.deleteOne({ trxID: trxID });
            }

            if (delRes?.deletedCount) {
              const { modifiedCount } = await userCollection.updateOne(
                { email: email },
                { $inc: { balance: invoice?.willAdd || 0 } }
              );
              if (modifiedCount) {
                const { modifiedCount: modStatus } =
                  await transactionCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { status: "completed" } }
                  );
                const [summary] = await paymentMethodSummaryCollection
                  .find()
                  .toArray();
                console.log(summary);
                if (provider === "bkash") {
                  await paymentMethodSummaryCollection.updateOne(
                    { _id: new ObjectId(summary._id) },
                    { $inc: { bkash: amount } }
                  );
                } else if (provider === "nagad") {
                  await paymentMethodSummaryCollection.updateOne(
                    { _id: new ObjectId(summary._id) },
                    { $inc: { nagad: amount } }
                  );
                }
                if (modStatus) {
                  return res.send({
                    success: true,
                    isBanned: false,
                    attempt: invoice.attempt + 1,
                    message: "balance added and transaction completed",
                  });
                } else {
                  await userCollection.updateOne(
                    { email: email },
                    { $inc: { balance: invoice?.willAdd * -1 } }
                  );
                  return res.send({
                    success: false,
                    isBanned: false,
                    attempt: invoice.attempt + 1,
                    message:
                      "Something went wrong while updating transaction status",
                  });
                }
              } else {
                return res.send({
                  success: false,
                  isBanned: false,
                  attempt: invoice.attempt + 1,
                  message: "Something went wrong while adding balance.",
                });
              }
            } else {
              return res.send({
                success: false,
                isBanned: false,
                attempt: invoice.attempt + 1,
                message: "Something went wrong. Please contact to support.",
              });
            }
          } else {
            return res.send({
              success: false,
              isBanned: false,
              attempt: invoice.attempt + 1,
              message:
                "You provided wrong information. Try again with correct information",
            });
          }
        } else {
          return res.send({
            success: false,
            isBanned: false,
            attempt: invoice.attempt + 1,
            message: "Please wait and try again later",
          });
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // transaction related api
    // /transaction
    app.get("/transaction", verifyToken, async (req, res) => {
      try {
        const { id, email } = req.query;
        const { email: emailInToken } = req.user;
        if (email !== emailInToken) {
          return res.status(401).send({ message: "unauthorized" });
        }
        const filter = { _id: new ObjectId(id) };
        const result = await transactionCollection.findOne(filter);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /transaction/all
    app.get("/transactions", verifyToken, async (req, res) => {
      try {
        const { trxID, email, page, limit } = req.query;
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);

        const { email: emailCookie, role } = req.user;
        let mail;
        if (role === "user") {
          mail = emailCookie;
        } else if (role === "admin") {
          mail = email;
        }
        let filter = {};
        if (role === "user") {
          filter = { email: mail };
        } else if (role === "admin") {
          filter = {
            email: { $regex: new RegExp(mail, "i") },
            trxID: { $regex: new RegExp(trxID, "i") },
          };
        }
        const trxCount = await transactionCollection.countDocuments(filter);
        const result = await transactionCollection
          .find(filter)
          .sort({ time: -1 })
          .skip((pageInt - 1) * limit)
          .limit(limitInt)
          .toArray();
        res.send({ trxCount, transactions: result });
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /transaction/admin/status
    app.patch("/transactions/updateStatus", verifyAdmin, async (req, res) => {
      try {
        const { id, status } = req.query;
        if (status === "cancel") {
          const result = await transactionCollection.deleteOne({
            _id: new ObjectId(id),
          });
          return res.send(result);
        }
        const invoice = await transactionCollection.findOne({
          _id: new ObjectId(id),
        });
        const { method, email, trxID, toPay } = invoice || {};
        const provider = method.split(" ")[0];
        const category = method.split(" ")[1];
        const blockTrx = { provider, category, trxID };
        await userCollection.updateOne(
          { email: email },
          { $inc: { balance: invoice?.willAdd } }
        );
        await transactionCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: "completed", method: method + "(Admin Approved)" } }
        );
        await blockedTrxCollection.insertOne(blockTrx);
        const [summary] = await paymentMethodSummaryCollection.find().toArray();
        if (provider === "bkash") {
          await paymentMethodSummaryCollection.updateOne(
            { _id: new ObjectId(summary._id) },
            { $inc: { bkash: toPay } }
          );
        } else if (provider === "nagad") {
          await paymentMethodSummaryCollection.updateOne(
            { _id: new ObjectId(summary._id) },
            { $inc: { nagad: toPay } }
          );
        }
        res.send({ completed: true, message: "updated status" });
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // device id related api
    // /device/admin/all
    app.get("/devices/all", verifyAdmin, async (req, res) => {
      try {
        const result = await deviceIdCollections.find().toArray();
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /device/admin/add
    app.post("/devices/add", verifyAdmin, async (req, res) => {
      try {
        const device = req.body;
        const result = await deviceIdCollections.insertOne(device);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /device/admin/delete
    app.delete("/devices/delete", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.query;
        const filter = { _id: new ObjectId(id) };
        const result = await deviceIdCollections.deleteOne(filter);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // block trx related api
    // /transaction/block/admin/all
    app.get("/blockTrx/all", verifyAdmin, async (req, res) => {
      try {
        const { trxID, page, limit } = req.query;

        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);
        const filter = { trxID: { $regex: new RegExp(trxID, "i") } };

        const totalTrx = await blockedTrxCollection.countDocuments(filter);
        const result = await blockedTrxCollection
          .find(filter)
          .sort({ _id: -1 })
          .skip((pageInt - 1) * limitInt)
          .limit(limitInt)
          .toArray();
        res.send({ totalTrx, blockedTrx: result });
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /transaction/block/admin/add
    app.post("/blockTrx/add", verifyAdmin, async (req, res) => {
      try {
        const newBlock = req.body;
        const result = await blockedTrxCollection.insertOne(newBlock);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    // /transaction/block/admin/delete
    app.delete("/blockTrx/delete", verifyAdmin, async (req, res) => {
      try {
        const { id } = req.query;
        const filter = { _id: new ObjectId(id) };
        const result = await blockedTrxCollection.deleteOne(filter);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // sms sender api
    // /message/sender
    app.post("/message/sender", async (req, res) => {
      try {
        const { from, message, deviceID } = req.body;
        const deviceCount = await deviceIdCollections.countDocuments({
          deviceID,
        });
        if (deviceCount <= 0) {
          return res.send({ message: "not valid device" });
        }
        const newTrx = {
          provider: "",
          category: "",
          amount: 0,
          trxID: "",
          time: new Date(),
        };
        let result = {};
        if (from === "bKash") {
          newTrx.provider = "bkash";
          if (message.includes("Cash Out") && message.includes("successful")) {
            const msgSplit = message.split(" ");
            newTrx.category = "agent";
            newTrx.amount = parseFloat(message.split(" ")[3].replace(/,/, ""));
            newTrx.trxID = msgSplit[msgSplit.indexOf("TrxID") + 1];
          } else if (
            message.includes("received") &&
            message.includes("from") &&
            !message.includes("Cashback")
          ) {
            const msgSplit = message.split(" ");
            newTrx.category = "personal";
            newTrx.amount = parseFloat(msgSplit[4].replace(/,/, ""));
            newTrx.trxID = msgSplit[msgSplit.indexOf("TrxID") + 1];
          } else if (
            message.includes("Cash In") &&
            message.includes("from") &&
            message.includes("successful")
          ) {
            const msgSplit = message.split(" ");
            newTrx.category = "personal";
            newTrx.amount = parseFloat(msgSplit[3].replace(/,/, ""));
            newTrx.trxID = msgSplit[msgSplit.indexOf("TrxID") + 1];
          }
        } else if (from === "NAGAD") {
          newTrx.provider = "nagad";
          if (message.includes("Cash Out")) {
            const msgSplit = message.split(/ |\n/);
            newTrx.category = "agent";
            newTrx.amount = parseFloat(msgSplit[5].replace(/,/, ""));
            newTrx.trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
          } else if (message.includes("Money Received.")) {
            const msgSplit = message.split(/ |\n/);
            newTrx.category = "personal";
            newTrx.amount = parseFloat(
              msgSplit[msgSplit.indexOf("Amt:") + 2].replace(/,/, "")
            );
            newTrx.trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
          } else if (message.includes("Cash In Received.")) {
            const msgSplit = message.split(/ |\n/);
            newTrx.category = "personal";
            newTrx.amount = parseFloat(
              msgSplit[msgSplit.indexOf("Amt:Tk") + 1].replace(/,/, "")
            );
            newTrx.trxID = msgSplit[msgSplit.indexOf("TxnID:") + 1];
          }
        }
        console.log(newTrx);
        if (newTrx.provider === "bkash" && newTrx.category.length > 0) {
          result = await bkashTrxCollection.insertOne(newTrx);
        } else if (newTrx.provider === "nagad" && newTrx.category.length > 0) {
          result = await nagadTrxCollection.insertOne(newTrx);
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
connectToDB().then(async () => {
  run().catch(console.dir);
});
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
