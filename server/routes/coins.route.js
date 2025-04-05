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
  coinsLeadearboard,
  getCoinProduct,
  getAllCoinProducts,
  addCoinProducts,
  updateCoinProducts,
  deleteCoinProducts,
} = require("../controllers/coins.controller");

const coinRotues = () => {
  // /coins/
  router.get("/product", verifyToken, getCoinProduct);
  router.get("/product/all", verifyToken, getAllCoinProducts);
  router.get("/leaderboard", coinsLeadearboard);
  router.get("/history", verifyToken, getCoinHistory);
  router.get("/daily", verifyToken, getDailyCoinNumber);
  router.get("/review", verifyToken, getReviewAmount);
  router.get("/settings", verifyAdmin, getCoinSettings);
  router.post("/review", verifyToken, claimReviewAmount);
  router.post("/product/add", verifyAdmin, addCoinProducts);
  router.post("product/update", verifyAdmin, updateCoinProducts);
  router.patch("/review/status", verifyAdmin, changeReviewStatus);
  router.patch("/settings", verifyAdmin, updateCoinSetting);
  router.patch("/daily", verifyToken, claimDailyCoin);
  router.delete("/product/delete", verifyAdmin, deleteCoinProducts);
  return router;
};

module.exports = coinRotues;
