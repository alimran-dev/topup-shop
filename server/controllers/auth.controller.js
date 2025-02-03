const jwt = require("jsonwebtoken");
require("dotenv").config();
const { cookieOption } = require("../utils/cookieOption");
const { dbCollections } = require("../config/db");
const userCollection = dbCollections.userCollection;

const isAdmin = async (req, res) => {
  try {
    const { email, role } = req.user || {};
    const userInDb = await userCollection.findOne({ email: email });
    if (!userInDb) {
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ message: "unauthorized" });
    } else if (role === "admin") {
      res.send({ isAdmin: true });
    } else {
      res.send({ isAdmin: false });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const jwtHandler = async (req, res) => {
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
    res.cookie("access-token", token, cookieOption(1000 * 60 * 60 * 24 * 30));
    res.send({ success: true });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const logout = (req, res) => {
  try {
    const user = req.body;
    console.log(user);
    res.cookie("access-token", "", cookieOption(0));
    res.send({ success: true });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};
module.exports = { isAdmin, jwtHandler, logout };
