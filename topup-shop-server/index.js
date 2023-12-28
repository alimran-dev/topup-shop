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
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// custom middleware
const verifyToken = async (req, res, next) => {
  const { "access-token": token } = req.cookies;
  if (!token) {
    return res.status(401).send({ message: "not authorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res
        .clearCookie("access-token", {
          maxAge: 0,
          secure: true,
          sameSite: "none",
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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tklaef2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const database = client.db("mezbaGamingDB");
const userCollection = database.collection("users");
const orderCollection = database.collection("orders");
const unipinCollection = database.collection("unipins");
const idcodeCollection = database.collection("idcodes");
const weeklyMonthlyCollection = database.collection("weeklyMonthly");
const shellCollection = database.collection("shells");

async function run() {
  try {
    // auth related api
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "31d",
      });
      res.cookie("access-token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
      res.send({ success: true });
    });
    app.post("/logout", (req, res) => {
      const user = req.body;
      console.log(user);
      res.clearCookie("access-token", {
        maxAge: 0,
        secure: true,
        sameSite: "none",
      });
      res.send({ success: true });
    });

    // user related api
    app.get("/user", verifyToken, async (req, res) => {
      const email = req.user.email;
      const filter = { email };
      const result = await userCollection.findOne(filter);
      res.send(result);
    });
    app.post("/users", async (req, res) => {
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
        balance: 0,
        spent: 0,
        orders: 0,
      };
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // order related api
    app.get("/orders", verifyToken, async (req, res) => {
      const { email, page, limit } = req.query;
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      console.log({ email, pageInt, limitInt });
      const emailDecoded = req.user?.email;
      if (email !== emailDecoded) {
        return res.status(401).send({ error: "unauthorized" });
      }
      const totalOrders = await orderCollection.countDocuments({ email: email });
      const result = await orderCollection.find({ email: email },{sort: {updateTime: -1}}).skip((pageInt-1)*limitInt).limit(parseInt(limitInt)).toArray();
      res.send({orders: result,total: totalOrders});
    })
    app.post("/purchase/unipin", verifyToken, async (req, res) => {
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
          .clearCookie("access-token", {
            maxAge: 0,
            secure: true,
            sameSite: "none",
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
        res.status(201).send({orderID:result.insertedId,price:orderPrice});
      }
    });

    // option and code admin api
    app.get("/options", async (req, res) => {
      const { category } = req.query;
      console.log(category);
      const filterOption = {
        sort: { uc: 1 },
        projection: {
          name: 1,
          price: 1,
          uc: 1,
          stock: {
            $cond: {
              if: { $lt: [{ $size: "$codes" }, 10] },
              then: { $size: "$codes" },
              else: null,
            },
          },
        },
      };
      let result;
      if (category === "unipin") {
        result = await unipinCollection.find({}, filterOption).toArray();
      }
      res.send(result);
    });
    app.post("/addOption/:category", async (req, res) => {
      const category = req.params.category;
      const { name, price, uc } = req.body;
      const option = { name, price, uc, codes: [] };
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
          result = await idcodeCollection.insertOne(option);
        }
      } else if (category === "weekly") {
        const isAvailable = await weeklyMonthlyCollection.findOne({ uc: uc });
        if (isAvailable) {
          return res.send({ message: "Option available for this UC." });
        } else {
          result = await weeklyMonthlyCollection.insertOne(option);
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
    });
    app.post("/addCodes/:category", async (req, res) => {
      const category = req.params.category;
      const codesArray = req.body;
      codesArray.forEach(async (item) => {
        if (category === "unipin") {
          const filter = { uc: item.uc };
          const result = await unipinCollection.updateOne(filter, {
            $addToSet: { codes: { $each: item.codes } },
          });
        }
      });
      res.send({ message: "Updated successfully" });
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
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
