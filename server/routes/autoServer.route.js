const { getUsername, getUnipinsData, getOrderInfo, addUnipinsToAuto, newOrder, getAutoServerImage, updateAutoStatus } = require("../controllers/autoServer.controller");
const {verifyToken} = require("../middlewares/verifyToken");
const {verifyAdmin} = require("../middlewares/verifyAdmin");

const router = require("express").Router();



const autoServerRoutes = () =>{
  // /auto
  router.get("/username",verifyToken,getUsername);
  router.get("/unipins-data",verifyAdmin,getUnipinsData);
  router.get("/order-info",verifyAdmin,getOrderInfo);
  router.get("/image",getAutoServerImage);
  router.post("/new-order", newOrder);
  router.post("/add-unipins",verifyAdmin,addUnipinsToAuto);
  router.patch("/update-status",verifyAdmin, updateAutoStatus);
  return router;
}


module.exports = autoServerRoutes;