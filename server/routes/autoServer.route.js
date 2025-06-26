const { getUsername, getUnipinsData, getOrderInfo, addUnipinsToAuto, newOrder } = require("../controllers/autoServer.controller");
const {verifyToken} = require("../middlewares/verifyToken");
const {verifyAdmin} = require("../middlewares/verifyAdmin");

const router = require("express").Router();



const autoServerRoutes = () =>{
  // /auto
  router.get("/username",verifyToken,getUsername);
  router.get("/unipins-data",verifyAdmin,getUnipinsData);
  router.get("/order-info",getOrderInfo);
  router.post("/new-order", newOrder);
  router.post("/add-unipins",verifyAdmin,addUnipinsToAuto);
  return router;
}


module.exports = autoServerRoutes;