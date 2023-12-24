const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
const PORT = process.env.PORT || 5000;


// middlewares
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// custom middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "not authorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "unauthorized" });
    }
    req.user = decoded;
    next();
  });
};


app.get('/', (req, res) => {
    res.send("game shop server is running");
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tklaef2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const database = client.db("mezbaGamingDB");
const userCollection = database.collection("users");

async function run() {
  try {
    // auth related api
    app.post('/jwt', (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "31d" });
      res.cookie("access-token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 1000*60*60*24*30 });
      res.send({success: true});
    })
    app.post('/logout', (req, res) => {
      const user = req.body;
      console.log(user);
      res.clearCookie("access-token", { maxAge: 0, secure: true, sameSite: "none" });
      res.send({ success: true });
    })


    // user related api
    app.post('/users', async (req, res) => {
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
    })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})
