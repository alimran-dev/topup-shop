const axios = require("axios");

const axiosCloudflare = axios.create({
  baseURL: "https://challenges.cloudflare.com/",
  headers: {
    "Content-Type": "application/json",
  }
})

module.exports = {axiosCloudflare}