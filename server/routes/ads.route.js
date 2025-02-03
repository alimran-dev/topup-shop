const express = require('express');
const { getAds, addAds, removeAds } = require('../controllers/ads.controller');
const { verifyAdmin } = require('../middlewares/verifyAdmin');
const router = express.Router();

const adsRoute = () =>{
    router.get('/', getAds);
    router.post("/post", verifyAdmin, addAds);
    router.post("/remove", verifyAdmin, removeAds);

    return router;
}

module.exports = adsRoute;