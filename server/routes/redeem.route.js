const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  getAllRedeemCode,
  addRedeemCode,
  updateRedeemCode,
  checkRedeemCode,
  deleteRedeemCode,
  getClaimedUsers,
} = require("../controllers/redeem.controller");

const redeemRotues = () => {
  // /redeem
  router.get("/claimedBy", verifyAdmin, getClaimedUsers);
  router.get("/all", verifyAdmin, getAllRedeemCode);
  router.post("/add", verifyAdmin, addRedeemCode);
  router.patch("/update", verifyAdmin, updateRedeemCode);
  router.patch("/check", verifyToken, checkRedeemCode);
  router.delete("/delete", verifyAdmin, deleteRedeemCode);
  return router;
};

module.exports = redeemRotues;
