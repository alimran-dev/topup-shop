const express=require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { subscribe, sendNotification } = require("../controllers/notification.controller");
const router= express.Router();

const notificationRoutes=()=>{
  router.post("/subscribe",verifyToken,subscribe);
  router.post("/send",sendNotification);
  return router;
}

module.exports=notificationRoutes;