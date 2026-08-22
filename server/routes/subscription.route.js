const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  getCatalog,
  getAdminTypes,
  addType,
  updateType,
  deleteType,
  getAdminPackages,
  getAdminPackage,
  addPackage,
  updatePackage,
  deletePackage,
  purchaseSubscription,
  getMySubscriptions,
  getMySubscriptionHistory,
  getAdminSubscribers,
  adminAction,
  getAdminHistory,
} = require("../controllers/subscription.controller");

const subscriptionRoute = () => {
  // public
  router.get("/catalog", getCatalog);

  // user
  router.post("/purchase", verifyToken, purchaseSubscription);
  router.get("/my", verifyToken, getMySubscriptions);
  router.get("/my/history", verifyToken, getMySubscriptionHistory);

  // admin — types
  router.get("/admin/types", verifyAdmin, getAdminTypes);
  router.post("/admin/types", verifyAdmin, addType);
  router.patch("/admin/types", verifyAdmin, updateType);
  router.delete("/admin/types", verifyAdmin, deleteType);

  // admin — packages
  router.get("/admin/packages", verifyAdmin, getAdminPackages);
  router.get("/admin/packages/get", verifyAdmin, getAdminPackage);
  router.post("/admin/packages", verifyAdmin, addPackage);
  router.patch("/admin/packages", verifyAdmin, updatePackage);
  router.delete("/admin/packages", verifyAdmin, deletePackage);

  // admin — subscribers / actions / history
  router.get("/admin/subscribers", verifyAdmin, getAdminSubscribers);
  router.post("/admin/actions", verifyAdmin, adminAction);
  router.get("/admin/history", verifyAdmin, getAdminHistory);

  return router;
};

module.exports = subscriptionRoute;
