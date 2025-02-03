const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const followUsCollection = dbCollections.followUsCollection;

const getContacts = async (req, res) => {
  try {
    const { id } = req.query;
    let filter = {};
    if (id) {
      filter = { _id: new ObjectId(id) };
    }
    const result = await followUsCollection
      .find(filter)
      .sort({ sequence: 1 })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addContacts = async (req, res) => {
  try {
    const { text, icon, url } = req.body;
    console.log(text, icon, url);
    if (!text || !icon || !url) {
      return res.send({ success: false, message: "Invalid request" });
    }
    const contactCount = (await followUsCollection.countDocuments()) || 0;
    const newContact = {
      text,
      icon,
      url,
      sequence: contactCount + 1,
    };
    const result = await followUsCollection.insertOne(newContact);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateContacts = async (req, res) => {
  try {
    const { id, text, icon, url, sequence } = req.body;
    const updatedContact = { $set: {} };
    if (text) {
      updatedContact.$set.text = text;
    }
    if (icon) {
      updatedContact.$set.icon = icon;
    }
    if (url) {
      updatedContact.$set.url = url;
    }
    if (parseInt(sequence)) {
      updatedContact.$set.sequence = parseInt(sequence);
    }
    const result = await followUsCollection.updateOne(
      { _id: new ObjectId(id) },
      updatedContact
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteContacts = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await followUsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getContacts, addContacts, updateContacts, deleteContacts };
