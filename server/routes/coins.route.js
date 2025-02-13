const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { verifyToken } = require("../middlewares/verifyToken");
const { updateCoinSetting, getCoinSettings } = require("../controllers/coins.controller");

const coinRotues = () => {
  // /coins/
  router.get("/settings",getCoinSettings)
  router.patch("/settings",verifyAdmin, updateCoinSetting);
  return router;
};

module.exports = coinRotues;
