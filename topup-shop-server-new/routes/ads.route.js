const express = require('express');
const { getAds, addAds } = require('../controllers/ads.controller');
const { verifyAdmin } = require('../middlewares/verifyAdmin');
const router = express.Router();

const adsRoute = () =>{
    router.get('/', getAds);
    router.post("/post", verifyAdmin, addAds);

    return router;
}

module.exports = adsRoute;