const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { getNotice, updateNotice } = require("../controllers/notice.controller");

const noticeRoute = () => {
    // /notice/
    router.get("/", getNotice);

    // admin
    router.patch("/admin/update", verifyAdmin, updateNotice);
    return router;
}

module.exports = noticeRoute;