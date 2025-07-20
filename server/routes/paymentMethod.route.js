const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  getMethods,
  addMethod,
  updateMethod,
  deleteMethod,
  methodSummary,
  methodReset,
  adjustBalance,
  bkashCreatePayment,
  bkashCallback,
  getTodaysAdminAdd,
} = require("../controllers/paymentMethod.controller");
const { bkashToken } = require("../middlewares/bkashToken");

const paymentMethodRoute = () => {
  // /payment/
  router.get("/methods", verifyToken, getMethods);
  router.get("/admin/added", verifyAdmin, getTodaysAdminAdd);
  router.get("/bkash/callback", bkashToken, bkashCallback);
  router.post("/bkash/create",verifyToken, bkashToken, bkashCreatePayment);

  // admin
  router.post("/method/admin/add", verifyAdmin, addMethod);
  router.patch("/method/admin/update", verifyAdmin, updateMethod);
  router.delete("/method/admin/delete", verifyAdmin, deleteMethod);

  // balance related (admin)
  router.get("/method/admin/balance/summary", verifyAdmin, methodSummary);
  router.patch("/method/admin/balance/reset", verifyAdmin, methodReset);
  router.patch("/method/admin/balance/adjust", verifyAdmin, adjustBalance);
  return router;
};

module.exports = paymentMethodRoute;
