const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { getTransaction, getAllTransaction, updateTrxStatus, getBlockTrx, addBlockTrx, deleteBlockTrx } = require("../controllers/transactions.controller");

const transactionsRoute = () => {
    // /transaction/
    router.get("/", verifyToken, getTransaction);
    router.get("/all", verifyToken, getAllTransaction);

    // admin
    router.patch("/admin/status", verifyAdmin, updateTrxStatus);

    // block trx related
    router.get("/block/admin/all", verifyAdmin, getBlockTrx);
    router.post("/block/admin/add", verifyAdmin, addBlockTrx);
    router.delete("/block/admin/delete", verifyAdmin, deleteBlockTrx);
    return router;
}

module.exports = transactionsRoute;