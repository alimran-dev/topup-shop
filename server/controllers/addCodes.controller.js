const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { unipinCollection, shellCollection } = dbCollections;

const addCodes = async (req, res) => {
  try {
    const category = req.params.category;
    const id = req.params.id;
    const codesArray = req.body;
    console.log(codesArray, id);
    if (category === "unipin") {
      codesArray.forEach(async (item) => {
        const filter = { uc: item.uc };
        const result = await unipinCollection.updateOne(filter, {
          $addToSet: { codes: { $each: item.codes } },
        });
        console.log(result);
      });
    } else if (category === "shell") {
      const filter = { _id: new ObjectId(id) };
      const result = await shellCollection.updateOne(filter, {
        $addToSet: { codes: { $each: codesArray } },
      });
      console.log(result);
    }
    res.send({ message: "Updated successfully" });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { addCodes };
