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
  verifyUser,
  changePassword,
  tempReferIDGen,
  allReferHistory,
} = require("../controllers/user.controller");

const userRoute = () => {
  // /user/
  router.get("/profile", verifyToken, userProfile);
  router.get("/google/login", (req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: JSON.stringify(req.query),
    })(req, res, next);
  });
  router.get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: `${process.env.FRONTEND_DOMAIN}/login?success=false`,
    }),
    googleCallback
  );
  router.get("/refer/history", verifyToken, allReferHistory);
  router.post("/login", loginUser);
  router.post("/new", newUser);
  router.patch("/forget", forgetPassword);
  router.patch("/verify", verifyToken, verifyUser);
  router.patch("/change/password", verifyToken, changePassword);
  router.patch("/update", verifyToken, updateUser);
  router.patch("/temp/refer", tempReferIDGen);
  // admin
  router.get("/admin/all", verifyAdmin, getAllUser);
  router.patch("/admin/status", verifyAdmin, updateUserStatus);
  router.patch("/admin/balance", verifyAdmin, updateUserBalance);
  return router;
};

module.exports = userRoute;
