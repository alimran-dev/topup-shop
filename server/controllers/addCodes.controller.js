const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const { unipinCollection, shellCollection, rechargeCollection } = dbCollections;

const addCodes = async (req, res) => {
  try {
    const category = req.params.category;
    const id = req.params.id;
    const codesArray = req.body;
    // console.log(codesArray, id);
    if (category === "unipin") {
      const filter = { uc: item.uc };
      const result = await unipinCollection.updateOne(filter, {
        $addToSet: { codes: { $each: item.codes } },
      });
      if (result.modifiedCount) {
        return res.send({
          success: true,
          message: "Unipins added successfully",
        });
      }
    } else if (category === "shell") {
      const filter = { _id: new ObjectId(id) };
      const result = await shellCollection.updateOne(filter, {
        $addToSet: { codes: { $each: codesArray } },
      });
      if (result.modifiedCount) {
        return res.send({
          success: true,
          message: "Shells added successfully",
        });
      }
    } else if (category === "rechargeCards") {
      const filter = { _id: new ObjectId(id) };
      const result = await rechargeCollection.updateOne(filter, {
        $addToSet: { codes: { $each: codesArray } },
      });
      if (result.modifiedCount) {
        return res.send({
          success: true,
          message: "recharge cards added successfully",
        });
      }
    }
    res.send({ success: false, message: "Something went wrong." });
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { addCodes };
