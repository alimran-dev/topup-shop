const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");
const webpush = require("web-push");
const port = process.env.PORT || 5000;
const path = require("path");
const { connectToDB } = require("./config/db");
const { CONSTANTS } = require("./utils/constants");
require("./middlewares/passport");

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CONSTANTS.origin,
    credentials: true,
  })
);
app.use(passport.initialize());
app.use(express.static(path.join(__dirname,"public")));

webpush.setVapidDetails(
  "mailto:abir932islam@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const run = () => {
  app.get("/", (req, res) => {
    res.send("top-up shop server is running...");
  });

  // routers
  const authRoute = require("./routes/auth.route");
  const userRoute = require("./routes/user.route");
  const optionRoute = require("./routes/option.route");
  const addCodesRoute = require("./routes/addCodes.route");
  const orderRoute = require("./routes/order.route");
  const paymentMethodRoute = require("./routes/paymentMethod.route");
  const noticeRoute = require("./routes/notice.route");
  const addBalanceRoute = require("./routes/addBalance.route");
  const transactionsRoute = require("./routes/transactions.route");
  const paymentDeviceRoute = require("./routes/paymentDevice.route");
  const adminDashboardRoute = require("./routes/adminDashboard.route");
  const messageRoute = require("./routes/message.route");
  const rechargeRoutes = require("./routes/recharge.route");
  const adsRoute = require("./routes/ads.route");
  const serviceRoute = require("./routes/service.route");
  const bannerRoutes = require("./routes/banner.route");
  const followUsRoutes = require("./routes/followUs.route");
  const coinRoutes = require("./routes/coins.route");
  const redeemRotues = require("./routes/redeem.route");
  const specialOfferRoutes = require("./routes/specialOffer.route");
  const notificationRoutes = require("./routes/notification.route");
  const autoServerRoutes = require("./routes/autoServer.route");
  const categoryRoute = require("./routes/category.route");
  const serviceItemRoute = require("./routes/serviceItem.route");
  const subscriptionRoute = require("./routes/subscription.route");
  const subscriberPriceRoute = require("./routes/subscriberPrice.route");
  const siteSettingRoute = require("./routes/siteSetting.route");

  // routes
  app.use("/auth", authRoute());
  app.use("/user", userRoute());
  app.use("/option", optionRoute());
  app.use("/code", addCodesRoute());
  app.use("/order", orderRoute());
  app.use("/payment", paymentMethodRoute());
  app.use("/notice", noticeRoute());
  app.use("/balance", addBalanceRoute());
  app.use("/transaction", transactionsRoute());
  app.use("/device", paymentDeviceRoute());
  app.use("/dashboard", adminDashboardRoute());
  app.use("/recharge", rechargeRoutes());
  app.use("/message", messageRoute());
  app.use("/ads", adsRoute());
  app.use("/services", serviceRoute());
  app.use("/banners", bannerRoutes());
  app.use("/follows", followUsRoutes());
  app.use("/coins", coinRoutes());
  app.use("/redeem", redeemRotues());
  app.use("/special", specialOfferRoutes());
  app.use("/notification", notificationRoutes());
  app.use("/auto",autoServerRoutes());
  app.use("/category", categoryRoute());
  app.use("/serviceItems", serviceItemRoute());
  app.use("/subscription", subscriptionRoute());
  app.use("/subscriber-prices", subscriberPriceRoute());
  app.use("/site-settings", siteSettingRoute());
};

connectToDB((err) => {
  if (!err) {
    app.listen(port, () => {
      console.log(`server is running on port: ${port}`);
    });

    run();
  }
});