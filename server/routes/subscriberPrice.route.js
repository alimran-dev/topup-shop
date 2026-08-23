const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  getAdminPricing,
  upsertSubscriberPrice,
} = require("../controllers/subscriberPricing.controller");

const subscriberPriceRoute = () => {
  // admin only — central per-unit subscriber pricing for auto topup servers
  router.get("/admin", verifyAdmin, getAdminPricing);
  router.put("/admin", verifyAdmin, upsertSubscriberPrice);
  return router;
};

module.exports = subscriberPriceRoute;
