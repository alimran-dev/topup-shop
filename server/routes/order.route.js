const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { getAllOrder, orderAuto, orderManual, getAllOrderAdmin, getPending, orderProcess, orderDynamic } = require("../controllers/order.controller");

const orderRoute = () => {
    // /order/
    router.get("/all", verifyToken, getAllOrder);
    router.post("/new/auto/:category", verifyToken, orderAuto);
    router.post("/new/manual/:category", verifyToken, orderManual);
    router.post("/new/dynamic",verifyToken,orderDynamic);

    // admin
    router.get("/admin/all", verifyAdmin, getAllOrderAdmin);
    router.get("/admin/pending", verifyAdmin, getPending);
    router.patch("/admin/processing", verifyAdmin, orderProcess);
    return router;
}

module.exports = orderRoute;