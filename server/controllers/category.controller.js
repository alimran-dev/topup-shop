const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");

const categoryCollection = dbCollections.categoryCollection;
const serviceCollection = dbCollections.serviceCollection;

const getAllCategories = async (req, res) => {
  try {
    const result = await categoryCollection
      .find()
      .sort({ serial: 1 })
      .toArray();
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addCategory = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res
        .status(400)
        .send({ success: false, message: "Title is required" });
    }

    const total = await categoryCollection.countDocuments();
    const category = {
      title,
      serial: total + 1,
      isActive: true,
      createdAt: new Date(),
    };

    const result = await categoryCollection.insertOne(category);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id, title, serial, isActive } = req.body;
    if (!id) {
      return res
        .status(400)
        .send({ success: false, message: "Category ID is required" });
    }

    const updateFields = { $set: {} };
    if (title) updateFields.$set.title = title;
    if (serial !== undefined) updateFields.$set.serial = serial;
    if (isActive !== undefined) updateFields.$set.isActive = isActive;

    const result = await categoryCollection.updateOne(
      { _id: new ObjectId(id) },
      updateFields
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .send({ success: false, message: "Category ID is required" });
    }

    const categoryId = new ObjectId(id);

    // Delete the category
    const categoryResult = await categoryCollection.deleteOne({
      _id: categoryId,
    });

    // Delete all subcategories under this category
    const servicesResult = await serviceCollection.deleteMany({
      categoryId: categoryId,
    });

    res.send({
      success: true,
      categoryDeleted: categoryResult.deletedCount,
      subcategoriesDeleted: servicesResult.deletedCount,
    });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};