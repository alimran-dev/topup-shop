const axios = require("axios");
require("dotenv").config();

const axiosAuto = axios.create({
  baseURL: process.env.AUTO_SERVER_DOMAIN,
  timeout: 10000,
  headers: {
    "Authorization": process.env.AUTO_SERVER_API_KEY
  }
});

module.exports = { axiosAuto };
