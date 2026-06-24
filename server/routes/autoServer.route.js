const { getUsername, getUnipinsData, getOrderInfo, addUnipinsToAuto, newOrder, getAutoServerImage, updateAutoStatus } = require("../controllers/autoServer.controller");
const {verifyToken} = require("../middlewares/verifyToken");
const {verifyAdmin} = require("../middlewares/verifyAdmin");

const router = require("express").Router();



const autoServerRoutes = () =>{
  // /auto
  router.get("/username",verifyToken,getUsername);
  
  return router;
}


module.exports = autoServerRoutes;