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
    origin: ["https://mezbashop.com","https://www.mezbashop.com","http://localhost:5173"],
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
      return res.cookie("access-token","", {
        httpOnly: true,
        maxAge: 0,
        secure: true,
        sameSite: "none",
        domain: '.mezbashop.com',
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
      return res.cookie("access-token","", {
          httpOnly: true,
          maxAge: 0,
          secure: true,
          sameSite: "none",
          domain: '.mezbashop.com',
        })
        .status(401)
        .send({ message: "unauthorized" });
    }
    if (decoded.role !== "admin") {
      return res.cookie("access-token","", {
        httpOnly: true,
        maxAge: 0,
        secure: true,
        sameSite: "none",
        domain: '.mezbashop.com',
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

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tklaef2.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@127.0.0.1:27017/`;
// const uri = `mongodb://127.0.0.1:27017/`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
});

const database = client.db("mezbaGamingDB");
const userCollection = database.collection("users");
const orderCollection = database.collection("orders");
const unipinCollection = database.collection("unipins");
const idcodeCollection = database.collection("idcodes");
const weeklyMonthlyCollection = database.collection("weeklyMonthly");
const shellCollection = database.collection("shells");

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
    app.get("/isAdmin", verifyToken, async (req, res) => {
      try {
        const { email, role } = req.user || {};
        const userInDb = await userCollection.findOne({ email: email });
        if (!userInDb) {
          return res
            .clearCookie("access-token", {
              maxAge: 0,
              secure: true,
              sameSite: "none",
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
    app.post("/jwt", async (req, res) => {
      try {
        const { email } = req.body;
        const userInDb = await userCollection.findOne({ email: email });
        if (!userInDb) {
          return res.status(401).send({ error: "Unauthorized" });
        }
        const user = { email, role: userInDb.role };
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "31d",
        });
        res.cookie("access-token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 1000 * 60 * 60 * 24 * 30,
          domain: '.mezbashop.com',
        });
        res.send({ success: true });
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
    app.post("/logout",verifyToken, (req, res) => {
      try {
        const user = req.body;
        console.log(user);
        res.cookie("access-token","", {
          httpOnly: true,
          maxAge: 0,
          secure: true,
          sameSite: "none",
          domain: '.mezbashop.com',
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
    app.get("/user", verifyToken, async (req, res) => {
      try {
        const email = req.user.email;
        const filter = { email };
        const result = await userCollection.findOne(filter);
        if (result.isBanned) {
          return res.cookie("access-token","", {
            httpOnly: true,
            maxAge: 0,
            secure: true,
            sameSite: "none",
            domain: '.mezbashop.com',
          })
            .status(401)
            .send({ error: "User Blocked" });
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
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
    app.patch("/updateUser", verifyToken, async (req, res) => {
      try {
        const { name, email, phone, photo } = req.body;
        const emailDecoded = req.user?.email;
        if (email !== emailDecoded) {
          return res.status(401).send({ error: "Unauthorized" });
        }
        const updateUser = {
          $set: {
            name: name,
            phone: phone,
            photo: photo,
          },
        };
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
          return res.cookie("access-token","", {
            httpOnly: true,
            maxAge: 0,
            secure: true,
            sameSite: "none",
            domain: '.mezbashop.com',
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
    app.post("/purchase/idcode", verifyToken, async (req, res) => {
      try {
        const { id, email, uid } = req.body;
        const orderTime = new Date();
        if (!id || !email || !uid) {
          return res.status(400).send({ error: "Item Not Found" });
        }
        const emailInToken = req.user?.email;
        if (email !== emailInToken) {
          return res.cookie("access-token","", {
            httpOnly: true,
            maxAge: 0,
            secure: true,
            sameSite: "none",
            domain: '.mezbashop.com',
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
    app.post("/purchase/weekly", verifyToken, async (req, res) => {
      try {
        const { id, email, uid } = req.body;
        const orderTime = new Date();
        if (!id || !email || !uid) {
          return res.status(400).send({ error: "Item Not Found" });
        }
        const emailInToken = req.user?.email;
        if (email !== emailInToken) {
          return res.cookie("access-token","", {
            httpOnly: true,
            maxAge: 0,
            secure: true,
            sameSite: "none",
            domain: '.mezbashop.com',
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

    // option and code admin api
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
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
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
    app.post("/addCodes/:category", verifyAdmin, async (req, res) => {
      try {
        const category = req.params.category;
        const codesArray = req.body;
        console.log(codesArray);
        codesArray.forEach(async (item) => {
          if (category === "unipin") {
            const filter = { uc: item.uc };
            const result = await unipinCollection.updateOne(filter, {
              $addToSet: { codes: { $each: item.codes } },
            });
            console.log(result);
          }
        });
        res.send({ message: "Updated successfully" });
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
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
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
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
        }
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
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

    // TODO: jwt middleware verify
    // order related admin api
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
        const result = await orderCollection.updateOne(filter, updateOrder);
        res.send(result);
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });

    // TODO: verify admin
    // user related admin api
    app.get("/admin/users", verifyAdmin, async (req, res) => {
      try {
        const searchEmail = req.query?.email;
        console.log(searchEmail);
        if (searchEmail) {
          const result = await userCollection
            .find({ email: { $regex: new RegExp(searchEmail, "i") } })
            .toArray();
          res.send(result);
        } else {
          const result = await userCollection.find({ role: "user" }).toArray();
          res.send(result);
        }
      } catch (err) {
        console.error("Error: ", err.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      }
    });
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
    app.patch("/admin/user/balance", verifyAdmin, async (req, res) => {
      try {
        const { email, addBalance } = req.body;
        const addBalanceInt = parseInt(addBalance);
        if (!addBalance) {
          return res.status(400).send({ error: "Not Possible" });
        }
        const user = await userCollection.findOne({ email: email });
        if (user?.balance + addBalanceInt < 0) {
          return res.status(400).send({ error: "Not enough balance" });
        }
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
              $sort: {uc: 1}
            }
          ])
          .toArray();
        const result = {
          balance: balanceMetrics[0],
          orders: orderMetrics[0],
          unipins: unipinMetrics,
        };
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
connectToDB()
  .then(async () => {
    run().catch(console.dir);
  })
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
