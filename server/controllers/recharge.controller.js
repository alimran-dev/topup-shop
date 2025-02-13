const { dbCollections } = require("../config/db");
const rechargeCollection = dbCollections.rechargeCollection;

const getAllCompany = async (req, res) => {
    try {
        const result = await rechargeCollection.find({ docName: "companies" }, { sort: { serial: 1 }, projection: {docName: 0} }).toArray();
        res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};


module.exports={getAllCompany}