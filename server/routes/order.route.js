const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  getAllOrder,
  orderAuto,
  getAllOrderAdmin,
  getPending,
  orderProcess,
  orderDynamic,
  getLastOrder,
  orderBalanceRecharge,
  orderSpecialOffer,
  orderRechargeOffer,
  archivedUnipins,
  orderCoinProduct,
  getAllOrderSummary,
  autoServerOrderProcess,
} = require("../controllers/order.controller");

const orderRoute = () => {
  // /order/
  router.get("/all", verifyToken, getAllOrder);
  router.get("/last", getLastOrder);
  router.get("/archived", archivedUnipins);
  router.get("/summary",verifyAdmin,getAllOrderSummary);
  router.post("/new/auto/:category", verifyToken, orderAuto);
  router.post("/recharge/offer", verifyToken, orderRechargeOffer);
  router.post("/new/dynamic", verifyToken, orderDynamic);
  router.post("/new/special", verifyToken, orderSpecialOffer);
  router.post("/recharge/balance", verifyToken, orderBalanceRecharge);
  router.post("/coin/product", verifyToken, orderCoinProduct);

  // admin
  router.get("/admin/all", verifyAdmin, getAllOrderAdmin);
  router.get("/admin/pending", verifyAdmin, getPending);
  router.patch("/admin/processing", verifyAdmin, orderProcess);
  router.patch("/auto-server/processing", autoServerOrderProcess);
  return router;
};

module.exports = orderRoute;
