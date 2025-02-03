const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { addCodes } = require("../controllers/addCodes.controller");

const addCodesRoute = () => {
    // /code/
    router.post("/admin/add/:category/:id?", verifyAdmin, addCodes);
    return router;
}

module.exports = addCodesRoute;