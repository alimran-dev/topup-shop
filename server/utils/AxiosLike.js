const axios = require("axios");
require("dotenv").config();

const axiosLike = axios.create({
  baseURL: process.env.AUTO_LIKE_SERVER_DOMAIN,
  timeout: 10000,
  params: {
    api_key: process.env.AUTO_LIKE_API_KEY
  }
});

module.exports = { axiosLike };
