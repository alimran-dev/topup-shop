const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const {
  getOffer,
  getAllOffers,
  updateOffer,
  newOffer,
  deleteOffer,
} = require("../controllers/specialOffer.controller");
const { updateStock } = require("../controllers/option.controller");

const specialOfferRoute = () => {
  // /special/
  router.get("/offer/:id", getOffer);
  router.get("/offers/:server", getAllOffers);

  // admin
  router.patch("/offer/update", verifyAdmin, updateOffer);
  router.patch("/offer/stock", verifyAdmin, updateStock);
  router.post("/offer/new", verifyAdmin, newOffer);
  router.delete("/offer/delete", verifyAdmin, deleteOffer);
  return router;
};

module.exports = specialOfferRoute;
