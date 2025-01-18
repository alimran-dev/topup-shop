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
  addDynamicOption,
  deleteDynamicOption,
  updateDynamicOption,
} = require("../controllers/option.controller");

const optionRoute = () => {
  // /option/
  router.get("/", getOption);
  router.get("/all", getAllOption);

  // admin
  router.post("/admin/add/:category", verifyAdmin, addOption);
  router.post("/admin/dynamic/add",verifyAdmin,addDynamicOption);
  router.patch("/admin/update", verifyAdmin, updateOption);
  router.patch("/admin/update/dynamic",verifyAdmin,updateDynamicOption);
  router.patch("/admin/stock", verifyAdmin, updateStock);
  router.delete("/admin/delete", verifyAdmin, deleteOption);
  router.delete("/admin/dynamic/delete",verifyAdmin,deleteDynamicOption);
  return router;
};

module.exports = optionRoute;
