const express = require("express");
const { smsSender } = require("../controllers/message.controller");
const router = express.Router();


const messageRoute = () => {
    // /message/
    router.post("/sender", smsSender);
    return router;
}


module.exports = messageRoute;