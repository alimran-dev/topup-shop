const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  userProfile,
  newUser,
  updateUser,
  getAllUser,
  updateUserStatus,
  updateUserBalance,
} = require("../controllers/user.controller");

const userRoute = () => {
  // /user/
  router.get("/profile", verifyToken, userProfile);
  router.post("/new", newUser);
  router.patch("/update", verifyToken, updateUser);
  // admin
  router.get("/admin/all", verifyAdmin, getAllUser);
  router.patch("/admin/status", verifyAdmin, updateUserStatus);
  router.patch("/admin/balance", verifyAdmin, updateUserBalance);
  return router;
};

module.exports = userRoute;
