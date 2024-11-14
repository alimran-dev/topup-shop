const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  getOption,
  getAllOption,
  addOption,
  updateOption,
  updateStock,
  deleteOption,
} = require("../controllers/option.controller");

const optionRoute = () => {
  // /option/
  router.get("/", getOption);
  router.get("/all", getAllOption);

  // admin
  router.post("/admin/add/:category", verifyAdmin, addOption);
  router.patch("/admin/update", verifyAdmin, updateOption);
  router.patch("/admin/stock", verifyAdmin, updateStock);
  router.delete("/admin/delete", verifyAdmin, deleteOption);
  return router;
};

module.exports = optionRoute;
