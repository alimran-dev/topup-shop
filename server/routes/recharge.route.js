const express = require("express");
const router = express.Router();

const { getAllCompany } = require("../controllers/recharge.controller");

const rechargeRoutes = () => {
    router.get("/companies", getAllCompany);
    return router;
}

module.exports = rechargeRoutes;