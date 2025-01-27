const express = require("express");
const passport = require("passport");
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
  loginUser,
  forgetPassword,
  googleCallback,
} = require("../controllers/user.controller");

const userRoute = () => {
  // /user/
  router.get("/profile", verifyToken, userProfile);
  router.get(
    "/google/login",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  router.get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: `${process.env.FRONTEND_DOMAIN}/login?success=false&message=Failed to authenticate user`,
    }),
    googleCallback
  );
  router.post("/login", loginUser);
  router.post("/new", newUser);
  router.patch("/forget", forgetPassword);
  router.patch("/update", verifyToken, updateUser);
  // admin
  router.get("/admin/all", verifyAdmin, getAllUser);
  router.patch("/admin/status", verifyAdmin, updateUserStatus);
  router.patch("/admin/balance", verifyAdmin, updateUserBalance);
  return router;
};

module.exports = userRoute;
