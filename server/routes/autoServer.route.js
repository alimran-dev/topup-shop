const { getUsername, getShopStatus } = require("../controllers/autoServer.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const { verifyAdmin } = require("../middlewares/verifyAdmin");

const router = require("express").Router();



const autoServerRoutes = () => {
  // /auto
  router.get("/username", verifyToken, getUsername);
  router.get("/status", verifyAdmin, getShopStatus);

  return router;
}


module.exports = autoServerRoutes;