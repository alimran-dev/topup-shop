const express = require("express");
const {
  getAllServices,
  addSubCategory,
  getService,
  updateSubCategory,
  deleteSubCategory,
  getChildServices,
  checkHasChildren,
} = require("../controllers/service.controller");
const { verifyAdmin } = require("../middlewares/verifyAdmin");

const router = express.Router();

const serviceRoute = () => {
  // /services
  router.get("/", getAllServices);
  router.get("/get", getService);
  router.get("/children", getChildServices);
  router.get("/has-children", checkHasChildren);
  router.post("/new", verifyAdmin, addSubCategory);
  router.patch("/update", verifyAdmin, updateSubCategory);
  router.delete("/delete", verifyAdmin, deleteSubCategory);
  return router;
};

module.exports = serviceRoute;
