const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const specialOfferCollection = dbCollections.specialOfferCollection;

const getOffer = async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await specialOfferCollection.findOne(filter);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllOffers = async (req, res) => {
  try {
    const server = req.params.server;
    console.log(server);
    if (server === "indonesia") {
      const result = await specialOfferCollection
        .find({ server: "indonesia" })
        .sort({ inStock: -1, price: 1 })
        .toArray();
      res.send(result);
    } else if (server === "all") {
      const result = await specialOfferCollection
        .find({ server: "all" })
        .sort({ inStock: -1, price: 1 })
        .toArray();
      res.send(result);
    } else res.status(400).send({ message: "Wrong query" });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateOffer = async (req, res) => {
  try {
    const { id, name, price, description } = req.body;
    const filter = { _id: new ObjectId(id) };
    const option = {
      $set: {
        name: name,
        price: parseInt(price),
        description: description,
      },
    };
    const result = await specialOfferCollection.updateOne(filter, option);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    const filter = { _id: new ObjectId(id) };
    const option = {
      $set: {
        inStock: inStock,
      },
    };
    const result = await specialOfferCollection.updateOne(filter, option);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const newOffer = async (req, res) => {
  try {
    const { name, server, price, description } = req.body;
    const option = { name, server, price, description, inStock: true };
    const result = await specialOfferCollection.insertOne(option);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const { id } = req.query;
    const filter = { _id: new ObjectId(id) };
    const result = await specialOfferCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getOffer,
  getAllOffers,
  updateOffer,
  updateStock,
  newOffer,
  deleteOffer,
};
