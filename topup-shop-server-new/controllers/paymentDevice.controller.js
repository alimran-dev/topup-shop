const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const deviceIdCollections = dbCollections.deviceIdCollections;

const getAllDevices = async (req, res) => {
  try {
    const result = await deviceIdCollections.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addDevice = async (req, res) => {
  try {
    const device = req.body;
    const result = await deviceIdCollections.insertOne(device);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const { id } = req.query;
    const filter = { _id: new ObjectId(id) };
    const result = await deviceIdCollections.deleteOne(filter);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getAllDevices, addDevice, deleteDevice };
