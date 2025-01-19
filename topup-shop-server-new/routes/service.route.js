const express = require('express');
const { getAllServices, addSubCategory, getService, updateSubCategory} = require('../controllers/service.controller');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const router = express.Router();

const serviceRoute = () =>{
    // /services
    router.get("/", getAllServices);
    router.get("/get", getService);
    router.post("/new",verifyAdmin, addSubCategory);
    router.patch("/update",verifyAdmin, updateSubCategory);
    return router;
}


module.exports = serviceRoute;
