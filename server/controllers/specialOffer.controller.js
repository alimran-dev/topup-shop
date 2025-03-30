const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { specialOfferCollection } = dbCollections || {};

const getSpecialOffer = async (req, res) => {
  try {
    const { id } = req.query || {};
    const result = await specialOfferCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { claimedBy: 0 } }
    );
    res.send(result);
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllSpecialOffer = async (req, res) => {
  try {
    const result = await specialOfferCollection
      .find({isActive: true})
      .project({ claimedBy: 0 })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllSpecialOfferAdmin = async (req, res) => {
  try {
    const result = await specialOfferCollection
      .find()
      .project({ claimedBy: 0 })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addSpecialOffer = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      image,
      type,
      price,
      stock,
      tutorialTitle,
      tutorialUrl,
      inputs,
    } = req.body || {};
    const priceInt = parseInt(price);
    const stockInt = parseInt(stock);
    if (
      !title ||
      !shortDescription ||
      !image ||
      !type ||
      !tutorialTitle ||
      !tutorialUrl ||
      inputs.length == 0
    ) {
      return res.status(400).send({ message: "Invalid Request" });
    } else if ((isNaN(priceInt) || priceInt < 0) || (isNaN(stockInt) || stockInt < 0)) {
      return res.status(400).send({ message: "Invalid price or stock" });
    } else if (type !== "balance" && type !== "coin") {
      return res.status(400).send({ message: "Invalid balance type" });
    }
    const newOffer = {
      type,
      isActive: true,
      title,
      image,
      shortDescription,
      price: priceInt,
      stock: stockInt,
      tutorialTitle,
      tutorialUrl,
      inputs,
      createdAt: new Date(),
      claimedBy: [],
    };
    const result = await specialOfferCollection.insertOne(newOffer);
    res.send({ ...result, ...newOffer });
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateSpecialOffer = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      image,
      type,
      price,
      stock,
      isActive,
      tutorialTitle,
      tutorialUrl,
      inputs,
    } = req.body || {};
    const { id } = req.query || {};
    const priceInt = parseInt(price);
    const stockInt = parseInt(stock);
    if (
      !id ||
      !title ||
      !shortDescription ||
      !type ||
      !tutorialTitle ||
      !tutorialUrl ||
      inputs.length == 0
    ) {
      return res.status(400).send({ message: "Invalid Request" });
    } else if ((isNaN(priceInt) || priceInt < 0) || (isNaN(stockInt) || stockInt < 0)) {
      return res.status(400).send({ message: "Invalid price or stock" });
    } else if (type !== "balance" && type !== "coin") {
      return res.status(400).send({ message: "Invalid balance type" });
    }
    const updatedOffer = {
      type,
      isActive,
      title,
      shortDescription,
      price: priceInt,
      stock: stockInt,
      tutorialTitle,
      tutorialUrl,
      inputs,
    };
    if(image){
      updatedOffer.image=image;
    }
    const result = await specialOfferCollection.updateOne(
      { _id: new ObjectId(id) },
      {$set: updatedOffer}
    );
    res.send(result);
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteSpecialOffer = async (req, res) => {
  try {
    const { id } = req.query || {};
    if (!id) {
      return res.status(400).send({ message: "id query required" });
    }
    const result = await specialOfferCollection.deleteOne({_id: new ObjectId(id)});
    res.send(result);
  } catch (err) {
    console.error("SpecialOffer Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getSpecialOffer,
  getAllSpecialOffer,
  getAllSpecialOfferAdmin,
  addSpecialOffer,
  updateSpecialOffer,
  deleteSpecialOffer,
};
