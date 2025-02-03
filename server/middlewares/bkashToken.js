const { dbCollections } = require("../config/db");
const { paymentMethodCollection } = dbCollections || {};
require("dotenv").config();
const { axiosBkash } = require("../utils/axiosBkash");

const generateToken = async () => {
  try {
    // console.log(process.env.BKASH_PASSWORD,process.env.BKASH_USERNAME);
    const { data } = await axiosBkash.post(
      "/tokenized/checkout/token/grant",
      {
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: process.env.BKASH_USERNAME,
          password: process.env.BKASH_PASSWORD,
        },
      }
    );
    const newData = {
      lastTime: new Date(),
      expires_in: parseInt(data?.expires_in),
      id_token: data?.id_token,
      refresh_token: data?.refresh_token,
    };
    if (data?.statusMessage === "Successful") {
      await paymentMethodCollection.updateOne(
        { type: "auto" },
        { $set: newData }
      );
      return data?.id_token;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const bkashToken = async (req, res, next) => {
  try {
    const result = await paymentMethodCollection.findOne({ type: "auto" });
    if (result) {
      const { lastTime, expires_in, id_token } = result || {};
      const now = new Date().getTime();
      const previous = lastTime?.getTime();
      const diff = (now - previous) / 1000;
      const valid = parseInt(expires_in) - 50;
      if (diff >= valid) {
        req.token = await generateToken();
        if (!req.token) {
          return res.status(500).send("Internal Server Error");
        }
      } else {
        req.token = id_token;
      }
    } else {
      req.token = await generateToken();
      if (!req.token) {
        return res.status(500).send("Internal Server Error");
      }
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = { bkashToken };
