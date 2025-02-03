const axios = require("axios");
require("dotenv").config();

const axiosBkash = axios.create({
  baseURL: process.env.BKASH_BASE_URL,
});

module.exports = { axiosBkash };
