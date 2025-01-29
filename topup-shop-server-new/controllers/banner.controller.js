const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const bannerCollection = dbCollections.bannerCollection;

const getBanners = async (req, res) => {
  try {
    const { id } = req.query;
    let filter = {};
    if (id) {
      filter = { _id: new ObjectId(id) };
    }
    const result = await bannerCollection
      .find(filter)
      .sort({ sequence: 1 })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addNewBanner = async (req, res) => {
  try {
    const { image, url } = req.body;
    if (!image || !url) {
      return res.send({ success: false, message: "Invalid Request" });
    }
    const bannerCount = (await bannerCollection.countDocuments()) || 0;
    const banner = {
      image,
      url,
      sequence: bannerCount + 1,
    };
    const result = await bannerCollection.insertOne(banner);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { id, image, url, sequence } = req.body;
    const newBanner = { $set: {} };
    if (image) {
      newBanner.$set.image = image;
    }
    if (url) {
      newBanner.$set.url = url;
    }
    if (parseInt(sequence)) {
      newBanner.$set.sequence = parseInt(sequence);
    }
    const result = await bannerCollection.updateOne(
      { _id: new ObjectId(id) },
      newBanner
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await bannerCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getBanners, addNewBanner, updateBanner, deleteBanner };
