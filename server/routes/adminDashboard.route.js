const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { getDashboardData } = require("../controllers/adminDashboard.controller");


const adminDashboardRoute = () => {
    // /dashboard/
    router.get("/admin", verifyAdmin, getDashboardData);
    return router;
}

module.exports = adminDashboardRoute;