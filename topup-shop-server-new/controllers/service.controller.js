const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");

const serviceCollection = dbCollections.serviceCollection;

const getService = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await serviceCollection.findOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};
const getAllServices = async (req, res) => {
  try {
    const result = await serviceCollection
      .find()
      .project({ category: 1, title: 1, image: 1 })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addSubCategory = async (req, res) => {
  try {
    const { title, category, image, tutorialText, tutorialURL, inputs, rules } =
      req.body;
    if (
      title &&
      category &&
      image &&
      tutorialText &&
      tutorialURL &&
      inputs &&
      rules
    ) {
      const subCategory = {
        title,
        category,
        image,
        tutorialText,
        tutorialURL,
        inputs,
        rules,
        options: [],
      };
      const result = await serviceCollection.insertOne(subCategory);
      res.send(result);
    } else {
      console.log(
        title,
        category,
        image,
        tutorialText,
        tutorialURL,
        inputs,
        rules
      );
      res.status(400).send({ success: false, message: "Invalid request" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const {
      id,
      title,
      category,
      image,
      tutorialText,
      tutorialURL,
      inputs,
      rules,
    } = req.body;
    const newSubCategory = { $set: {} };
    if (title) {
      newSubCategory.$set.title = title;
    }
    if (category) {
      newSubCategory.$set.category = category;
    }
    if (image) {
      newSubCategory.$set.image = image;
    }
    if (tutorialText) {
      newSubCategory.$set.tutorialText = tutorialText;
    }
    if (tutorialURL) {
      newSubCategory.$set.tutorialURL = tutorialURL;
    }
    if (inputs) {
      newSubCategory.$set.inputs = inputs;
    }
    if (rules) {
      newSubCategory.$set.rules = rules;
    }
    const result = await serviceCollection.updateOne(
      { _id: new ObjectId(id) },
      newSubCategory
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.query || {};
    const result = await serviceCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getAllServices,
  addSubCategory,
  getService,
  updateSubCategory,
  deleteSubCategory,
};
