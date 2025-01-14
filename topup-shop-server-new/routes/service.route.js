const express = require('express');
const { getAllServices, addSubCategory, getService} = require('../controllers/service.controller');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const router = express.Router();

const serviceRoute = () =>{
    router.get("/", getAllServices);
    router.get("/get", getService);
    router.post("/new", addSubCategory);
    return router;
}


module.exports = serviceRoute;
