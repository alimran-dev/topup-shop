const { dbCollections } = require("../config/db");

const addAds = async (req, res) => {
  const data = req.body;
  try {
    const isDelete = await dbCollections.adsCollection.deleteMany({});
    if (isDelete) {
      const result = await dbCollections.adsCollection.insertOne(data);
      res.status(200).send(result);
    }
  } catch (error) {
    res.error(error);
  }
};

const getAds = async (req, res) => {
  try {
    const result = await dbCollections.adsCollection.findOne();
    res.send(result);
  } catch (error) {
    res.error(error);
  }
};

const removeAds = async (req, res) =>{
    try {
        const result = await dbCollections.adsCollection.deleteMany({});
        res.send(result);
    } catch (error) {
        res.error(error);
    }
}

module.exports = { addAds, getAds, removeAds };
