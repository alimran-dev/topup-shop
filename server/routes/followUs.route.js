const express = require("express");
const {
  getContacts,
  addContacts,
  updateContacts,
  deleteContacts,
} = require("../controllers/followUs.controller");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const router = express.Router();

const followUsRoutes = () => {
  // /follows
  router.get("/get", getContacts);
  router.post("/new", verifyAdmin, addContacts);
  router.patch("/update", verifyAdmin, updateContacts);
  router.delete("/delete", verifyAdmin, deleteContacts);
  return router;
};

module.exports = followUsRoutes;
