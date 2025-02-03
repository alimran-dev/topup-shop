const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  addNewBanner,
  getBanners,
  updateBanner,
  deleteBanner,
} = require("../controllers/banner.controller");

const BannersRoute = () => {
  // /banners
  router.get("/get", getBanners);
  router.post("/new", verifyAdmin, addNewBanner);
  router.patch("/update", verifyAdmin, updateBanner);
  router.delete("/delete", verifyAdmin, deleteBanner);
  return router;
};

module.exports = BannersRoute;
