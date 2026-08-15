const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  getServiceItems,
  getServiceItem,
  getFilterBounds,
  getAdminServiceItems,
  getAdminServiceItem,
  addServiceItem,
  updateServiceItem,
  toggleServiceItemActive,
  deleteServiceItem,
} = require("../controllers/serviceItem.controller");

const serviceItemRoute = () => {
  // /serviceItems/
  router.get("/", getServiceItems);
  router.get("/get", getServiceItem);
  router.get("/filters", getFilterBounds);

  // admin
  router.get("/admin/all", verifyAdmin, getAdminServiceItems);
  router.get("/admin/get", verifyAdmin, getAdminServiceItem);
  router.post("/new", verifyAdmin, addServiceItem);
  router.patch("/update", verifyAdmin, updateServiceItem);
  router.patch("/toggleActive", verifyAdmin, toggleServiceItemActive);
  router.delete("/delete", verifyAdmin, deleteServiceItem);
  return router;
};

module.exports = serviceItemRoute;
