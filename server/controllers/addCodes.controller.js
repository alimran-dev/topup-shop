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
      const documentsToInsert = [];
      codesArray.forEach((item)=>{
        item?.codes?.forEach((code)=>{
          documentsToInsert.push({
            uc: item?.uc,
            code: code,
            createdAt: new Date()
          });
        });
      });
      try {
        const result = await unipinCollection.insertMany(documentsToInsert, {ordered: false});
        return res.send({
          success: true,
          message: `${result.insertedCount} unipins added successfully`,
          insertedCount: result.insertedCount,
          totalAttempted: documentsToInsert.length
        })
      } catch (error) {
        return res.send({
          success: true,
          message: `${error?.result?.insertedCount} unipins added. some duplicate skipped`,
        })
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
