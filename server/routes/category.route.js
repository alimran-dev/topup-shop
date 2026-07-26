const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const categoryRoute = () => {
  // Public
  router.get("/", getAllCategories);

  // Admin only
  router.post("/", verifyToken, verifyAdmin, addCategory);
  router.patch("/", verifyToken, verifyAdmin, updateCategory);
  router.delete("/", verifyToken, verifyAdmin, deleteCategory);

  return router;
};

module.exports = categoryRoute;