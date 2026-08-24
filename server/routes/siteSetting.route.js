const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  getSiteSettings,
  updateSiteSettings,
} = require("../controllers/siteSetting.controller");

const siteSettingRoutes = () => {
  // Public — the Home page needs lastOrderShowPrice for guests too.
  router.get("/", getSiteSettings);
  router.patch("/", verifyAdmin, updateSiteSettings);
  return router;
};

module.exports = siteSettingRoutes;
