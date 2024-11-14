const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { connectToDB } = require("./config/db");

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://mezbashop.com",
      "https://www.mezbashop.com",
      "https://demo.mezbashop.com",
      "http://localhost:5173",
    ],
    credentials: true,
  })
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
  const specialOfferRoute = require("./routes/specialOffer.route");
  const orderRoute = require("./routes/order.route");
  const paymentMethodRoute = require("./routes/paymentMethod.route");
  const noticeRoute = require("./routes/notice.route");
  const addBalanceRoute = require("./routes/addBalance.route");
  const transactionsRoute = require("./routes/transactions.route");
  const paymentDeviceRoute = require("./routes/paymentDevice.route");
  const adminDashboardRoute = require("./routes/adminDashboard.route");
  const messageRoute = require("./routes/message.route");
  const rechargeRoutes = require("./routes/recharge.route");

  // routes
  app.use("/auth", authRoute());
  app.use("/user", userRoute());
  app.use("/option", optionRoute());
  app.use("/code", addCodesRoute());
  app.use("/special", specialOfferRoute());
  app.use("/order", orderRoute());
  app.use("/payment", paymentMethodRoute());
  app.use("/notice", noticeRoute());
  app.use("/balance", addBalanceRoute());
  app.use("/transaction", transactionsRoute());
  app.use("/device", paymentDeviceRoute());
  app.use("/dashboard", adminDashboardRoute());
  app.use("/recharge", rechargeRoutes());
  app.use("/message", messageRoute());
};

connectToDB((err) => {
  if (!err) {
    app.listen(port, () => {
      console.log(`server is running on port: ${port}`);
    });

    run();
  }
});
