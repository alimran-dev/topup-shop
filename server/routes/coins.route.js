const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  updateCoinSetting,
  getCoinSettings,
  getDailyCoinNumber,
  claimDailyCoin,
  getReviewAmount,
  claimReviewAmount,
  changeReviewStatus,
  getCoinHistory,
} = require("../controllers/coins.controller");

const coinRotues = () => {
  // /coins/
  router.get("/history", verifyToken, getCoinHistory);
  router.get("/daily", verifyToken, getDailyCoinNumber);
  router.get("/review", verifyToken, getReviewAmount);
  router.get("/settings", verifyAdmin, getCoinSettings);
  router.post("/review", verifyToken, claimReviewAmount);
  router.patch("/review/status", verifyAdmin, changeReviewStatus);
  router.patch("/settings", verifyAdmin, updateCoinSetting);
  router.patch("/daily", verifyToken, claimDailyCoin);
  return router;
};

module.exports = coinRotues;
