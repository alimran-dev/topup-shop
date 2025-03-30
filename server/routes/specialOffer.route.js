const express=require("express");
const { getSpecialOffer, getAllSpecialOffer, getAllSpecialOfferAdmin, addSpecialOffer, updateSpecialOffer, deleteSpecialOffer } = require("../controllers/specialOffer.controller");
const { verifyAdmin } = require("../middlewares/verifyAdmin");
const router=express.Router();


const specialOfferRoutes=()=>{
  // /special
  router.get("/get",getSpecialOffer);
  router.get("/all",getAllSpecialOffer);
  // for admin
  router.get("/admin/all",verifyAdmin,getAllSpecialOfferAdmin);
  router.post("/new",verifyAdmin,addSpecialOffer);
  router.patch("/update",verifyAdmin,updateSpecialOffer);
  router.delete("/delete",verifyAdmin,deleteSpecialOffer);
  return router;
}

module.exports=specialOfferRoutes;