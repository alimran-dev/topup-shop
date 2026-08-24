const express=require("express");
const { getSpecialOffer, getAllSpecialOffer, getAllSpecialOfferAdmin, addSpecialOffer, updateSpecialOffer, deleteSpecialOffer } = require("../controllers/specialOffer.controller");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const { verifyTokenOptional } = require("../middlewares/verifyTokenOptional");
const router=express.Router();


const specialOfferRoutes=()=>{
  // /special
  router.get("/get",verifyTokenOptional,getSpecialOffer);
  router.get("/all",verifyTokenOptional,getAllSpecialOffer);
  // for admin
  router.get("/admin/all",verifyAdmin,getAllSpecialOfferAdmin);
  router.post("/new",verifyAdmin,addSpecialOffer);
  router.patch("/update",verifyAdmin,updateSpecialOffer);
  router.delete("/delete",verifyAdmin,deleteSpecialOffer);
  return router;
}

module.exports=specialOfferRoutes;