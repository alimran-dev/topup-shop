const express = require('express');
const { getServices, postService } = require('../controllers/service.controller');
const { verifyAdmin } = require('../middlewares/verifyAdmin');

const router = express.Router();

const serviceRoute = () =>{
    router.get("/", getServices);
    router.post("/post", verifyAdmin, postService);
    return router;
}


module.exports = serviceRoute;
