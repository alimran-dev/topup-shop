const { getUsername, getUnipinsData, getOrderInfo, addUnipinsToAuto, newOrder } = require("../controllers/autoServer.controller");

const router = require("express").Router();



const autoServerRoutes = () =>{
  // /auto
  router.get("/username",getUsername);
  router.get("/unipins-data",getUnipinsData);
  router.get("/order-info",getOrderInfo);
  router.post("/new-order", newOrder);
  router.post("/add-unipins",addUnipinsToAuto);
  return router;
}


module.exports = autoServerRoutes;