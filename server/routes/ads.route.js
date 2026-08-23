const express = require("express");
const {
  getAds,
  getAdminAds,
  addAds,
  updateAds,
  deleteAds,
} = require("../controllers/ads.controller");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { verifyTokenOptional } = require("../middlewares/verifyTokenOptional");
const router = express.Router();

const adsRoute = () => {
  router.get("/", verifyTokenOptional, getAds);
  router.get("/admin", verifyAdmin, getAdminAds);
  router.post("/post", verifyAdmin, addAds);
  router.patch("/update", verifyAdmin, updateAds);
  router.delete("/delete", verifyAdmin, deleteAds);

  return router;
};

module.exports = adsRoute;
