const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const noticeCollection = dbCollections.noticeCollection;

const getNotice = async (req, res) => {
  try {
    const result = await noticeCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { id } = req.query;
    const doc = req.body;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: doc,
    };
    const result = await noticeCollection.updateOne(filter, updatedDoc, {
      upsert: true,
    });
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getNotice, updateNotice };
