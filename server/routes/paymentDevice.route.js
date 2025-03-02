const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  getAllDevices,
  addDevice,
  deleteDevice,
} = require("../controllers/paymentDevice.controller");

const paymentDeviceRoute = () => {
  // /device/
  // admin
  router.get("/admin/all", verifyAdmin, getAllDevices);
  router.post("/admin/add", verifyAdmin, addDevice);
  router.delete("/admin/delete", verifyAdmin, deleteDevice);

  return router;
};

module.exports = paymentDeviceRoute;
