const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { verifyToken } = require("../middlewares/verifyToken");
const { updateCoinSetting, getCoinSettings, getDailyCoinNumber, claimDailyCoin } = require("../controllers/coins.controller");

const coinRotues = () => {
  // /coins/
  router.get("/daily",verifyToken, getDailyCoinNumber);
  router.get("/settings",verifyAdmin,getCoinSettings)
  router.patch("/settings",verifyAdmin, updateCoinSetting);
  router.patch("/daily",verifyToken, claimDailyCoin);
  return router;
};

module.exports = coinRotues;
