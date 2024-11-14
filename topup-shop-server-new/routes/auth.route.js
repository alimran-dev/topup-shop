const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const {
  isAdmin,
  jwtHandler,
  logout,
} = require("../controllers/auth.controller");

const authRoute = () => {
  // /auth/
  router.get("/isAdmin", verifyToken, isAdmin);
  router.post("/jwt", jwtHandler);
  router.post("/logout", verifyToken, logout);
  return router;
};

module.exports = authRoute;
