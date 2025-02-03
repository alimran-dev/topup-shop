const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { addBalance, checkAddBalance, addBalanceOffer, addBalanceOfferUpdate } = require("../controllers/addBalance.controller");

const addBalanceRoute = () => {
    // /balance;
    router.post("/add", verifyToken, addBalance);
    router.patch("/add/check", verifyToken, checkAddBalance);

    // offer related
    router.get("/offer", addBalanceOffer);
    router.patch("/admin/offer/update", verifyAdmin, addBalanceOfferUpdate);
    return router;
}

module.exports = addBalanceRoute;