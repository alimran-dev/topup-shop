const { ObjectId } = require("mongodb");
const { dbCollections } = require("../config/db");
const unipinCollection = dbCollections.unipinCollection;
const idcodeCollection = dbCollections.idcodeCollection;
const weeklyMonthlyCollection = dbCollections.weeklyMonthlyCollection;
const shellCollection = dbCollections.shellCollection;
const airdropCollection = dbCollections.airdropCollection;
const lessIsMoreCollection = dbCollections.lessIsMoreCollection;
const rechargeCollection = dbCollections.rechargeCollection;
const serviceCollection = dbCollections.serviceCollection;

const getOption = async (req, res) => {
  try {
    const { category, id, docName } = req.query;
    const options = {
      $projection: {
        name: 1,
        price: 1,
        uc: 1,
        stock: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$category", "idcode"] },
                { $eq: ["$category", "weekly"] },
                { $eq: ["$category", "airdrop"] },
                { $eq: ["$category", "lessIsMore"] },
              ],
            },
            then: "$stock",
            else: {
              $cond: {
                if: { $lt: [{ $size: "$codes" }, 30] },
                then: { $size: "$codes" },
                else: null,
              },
            },
          },
        },
      },
    };
    const filterOptionRecharge = {
      sort: { price: 1 },
      projection: {
        name: 1,
        price: 1,
        category: 1,
        description: 1,
        stock: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$docName", "mbCard"] },
                { $eq: ["$docName", "minCard"] },
                { $eq: ["$docName", "balanceCard"] },
              ],
            },
            then: {
              $cond: {
                if: { $lt: [{ $size: "$codes" }, 30] },
                then: { $size: "$codes" },
                else: null,
              },
            },
            else: "$stock",
          },
        },
      },
    };
    const filter = { _id: new ObjectId(id) };
    let result;
    if (category === "unipin") {
      result = await unipinCollection.findOne(filter, options);
    } else if (category === "idcode") {
      result = await idcodeCollection.findOne(filter, options);
    } else if (category === "weekly-monthly") {
      result = await weeklyMonthlyCollection.findOne(filter, options);
    } else if (category === "shell") {
      result = await shellCollection.findOne(filter, options);
    } else if (category === "airdrop") {
      result = await airdropCollection.findOne(filter, options);
    } else if (category === "lessIsMore") {
      result = await lessIsMoreCollection.findOne(filter, options);
    } else if (category === "recharge") {
      result = await rechargeCollection.findOne(filter, filterOptionRecharge);
    }
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getAllOption = async (req, res) => {
  try {
    const { category, id, docName } = req.query;
    // console.log(category);
    const filterOption = {
      sort: { uc: 1 },
      projection: {
        name: 1,
        price: 1,
        uc: 1,
        category: 1,
        stock: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$category", "idcode"] },
                { $eq: ["$category", "weekly"] },
                { $eq: ["$category", "airdrop"] },
                { $eq: ["$category", "lessIsMore"] },
              ],
            },
            then: "$stock",
            else: {
              $cond: {
                if: { $lt: [{ $size: "$codes" }, 5] },
                then: { $size: "$codes" },
                else: null,
              },
            },
          },
        },
      },
    };
    const filterOptionRecharge = {
      sort: { price: 1 },
      projection: {
        name: 1,
        price: 1,
        category: 1,
        description: 1,
        stock: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$docName", "mbCard"] },
                { $eq: ["$docName", "minCard"] },
                { $eq: ["$docName", "balanceCard"] },
              ],
            },
            then: {
              $cond: {
                if: { $lt: [{ $size: "$codes" }, 5] },
                then: { $size: "$codes" },
                else: null,
              },
            },
            else: "$stock",
          },
        },
      },
    };
    let result;
    if (category === "unipin") {
      result = await unipinCollection.find({}, filterOption).toArray();
    } else if (category === "idcode") {
      result = await idcodeCollection.find({}, filterOption).toArray();
    } else if (category === "weekly-monthly") {
      result = await weeklyMonthlyCollection.find({}, filterOption).toArray();
    } else if (category === "shell") {
      result = await shellCollection.find({}, filterOption).toArray();
    } else if (category === "airdrop") {
      result = await airdropCollection.find({}, filterOption).toArray();
    } else if (category === "lessIsMore") {
      result = await lessIsMoreCollection.find({}, filterOption).toArray();
    } else if (category === "recharge") {
      result = await rechargeCollection
        .find({ docId: id, docName: docName }, filterOptionRecharge)
        .toArray();
    } else {
      return res.status(400).send({ error: "Bad Request" });
    }
    if (category === "unipin") {
      const sp = [161, 800, 162];
      result.sort((a, b) => {
        const idxA = sp.indexOf(a.uc);
        const idxB = sp.indexOf(b.uc);
        if (idxA !== -1 && idxB !== -1) {
          return idxA - idxB;
        } else if (idxA !== -1) {
          return 1;
        } else if (idxB !== -1) {
          return -1;
        }
        return a.uc - b.uc;
      });
    }
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addOption = async (req, res) => {
  try {
    const category = req.params.category;
    const { name, price, uc } = req.body;
    const option = { category, name, price, uc, codes: [] };
    const optionManual = { category, name, price, uc, stock: true };
    let result;
    if (category === "unipin") {
      const isAvailable = await unipinCollection.findOne({ uc: uc });
      if (isAvailable) {
        return res.send({ message: "Option available for this UC." });
      } else {
        result = await unipinCollection.insertOne(option);
      }
    } else if (category === "idcode") {
      const isAvailable = await idcodeCollection.findOne({ uc: uc });
      if (isAvailable) {
        return res.send({ message: "Option available for this UC." });
      } else {
        result = await idcodeCollection.insertOne(optionManual);
      }
    } else if (category === "weekly") {
      const isAvailable = await weeklyMonthlyCollection.findOne({ uc: uc });
      if (isAvailable) {
        return res.send({ message: "Option available for this UC." });
      } else {
        result = await weeklyMonthlyCollection.insertOne(optionManual);
      }
    } else if (category === "shell") {
      const isAvailable = await shellCollection.findOne({ uc: uc });
      if (isAvailable) {
        return res.send({ message: "Option available for this UC." });
      } else {
        result = await shellCollection.insertOne(option);
      }
    } else if (category === "airdrop") {
      const isAvailable = await airdropCollection.findOne({ uc: uc });
      if (isAvailable) {
        return res.send({ message: "Option available for this UC." });
      } else {
        result = await airdropCollection.insertOne(optionManual);
      }
    } else if (category === "lessIsMore") {
      const isAvailable = await lessIsMoreCollection.findOne({ uc: uc });
      if (isAvailable) {
        return res.send({ message: "Option available for this UC." });
      } else {
        result = await lessIsMoreCollection.insertOne(optionManual);
      }
    } else if (category === "recharge") {
      const { docName, name, price, description, category, operator, stock } =
        req.body || {};
        const priceInt=parseInt(price);
        const stockInt=parseInt(stock);
        if(docName!=="mbCard" && docName!=="minCard" && docName!=="balanceCard" && docName!=="mbOffer" && docName!=="minOffer" && docName!=="mbAndMinOffer"){
          return res.status(400).send({message: "Invalid docName"});
        } else if(isNaN(priceInt) || priceInt<0){
          return res.status(400).send({message: "Invalid price"});
        } else if(docName.includes("Offer") && isNaN(stockInt) && stockInt<0){
          return res.status(400).send({message: "Invalid stock"});
        }
      const companyDb = await rechargeCollection.findOne({
        docName: "companies",
        name: operator,
      });
      const rechargeOption = {
        docName,
        name,
        price: parseInt(price),
        description,
        docId: companyDb._id.toString(),
        category,
        operator,
      };
      if (category === "card") rechargeOption.codes = [];
      else if (category === "offer") rechargeOption.stock = stockInt;
      result = await rechargeCollection.insertOne(rechargeOption);
    } else {
      return res.send({ message: "category not matched" });
    }
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const addDynamicOption = async (req, res) => {
  try {
    const { name, price, id } = req.body;
    if (name && parseInt(price) && id) {
      const filter = { _id: new ObjectId(id) };
      const result = await serviceCollection.updateOne(filter, {
        $push: { options: { name, price: parseInt(price), stock: 0 } },
      });
      res.send(result);
    } else {
      res.send({ success: false, message: "Invalid request" });
    }
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateOption = async (req, res) => {
  try {
    const { id, category, name, price, description, type, stock } = req.body || {};
    const filter = { _id: new ObjectId(id) };
    if(isNaN(parseInt(price)) || parseInt(price)<0){
      return res.status(400).send({message: "Invalid Price"});
    }
    const updatedOption = {
      $set: {
        name: name,
        price: parseInt(price),
      },
    };
    if (category === "recharge" && description) {
      updatedOption.$set.description = description;
      if(type==="offer"){
        const stockInt=parseInt(stock);
        if(isNaN(stockInt) || stockInt<0){
          return res.status(400).send({message: "Invalid stock"});
        }
        updatedOption.$set.stock=stockInt;
      }
    }
    let result;
    if (category === "unipin") {
      result = await unipinCollection.updateOne(filter, updatedOption);
    } else if (category === "idcode") {
      result = await idcodeCollection.updateOne(filter, updatedOption);
    } else if (category === "weekly-monthly") {
      result = await weeklyMonthlyCollection.updateOne(filter, updatedOption);
    } else if (category === "shell") {
      result = await shellCollection.updateOne(filter, updatedOption);
    } else if (category === "airdrop") {
      result = await airdropCollection.updateOne(filter, updatedOption);
    } else if (category === "lessIsMore") {
      result = await lessIsMoreCollection.updateOne(filter, updatedOption);
    } else if (category === "recharge") {
      result = await rechargeCollection.updateOne(filter, updatedOption);
    }
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateDynamicOption = async (req, res) => {
  try {
    const {id, index, name, price, stock}=req.body;
    const service = await serviceCollection.findOne({ _id: new ObjectId(id) });
    if (!service) {
      return res.send({ success: false, message: "Service not found" });
    }
    if (!service.options || service.options.length === 0) {
      return res.send({ success: false, message: "No option found" });
    }
    const option = service.options[parseInt(index)];
    if (!option) {
      return res.send({ success: false, message: "Option not found" });
    }
    service.options[parseInt(index)].name=name;
    service.options[parseInt(index)].price=parseInt(price);
    service.options[parseInt(index)].stock=parseInt(stock);
    const result=await serviceCollection.updateOne({_id: new ObjectId(id)},{$set: {options: service.options}});
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id, category, stock } = req.body || {};
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        stock: stock,
      },
    };
    let result;
    if (category === "idcode") {
      result = await idcodeCollection.updateOne(filter, updatedDoc);
    } else if (category === "weekly-monthly") {
      result = await weeklyMonthlyCollection.updateOne(filter, updatedDoc);
    } else if (category === "airdrop") {
      result = await airdropCollection.updateOne(filter, updatedDoc);
    } else if (category === "lessIsMore") {
      result = await lessIsMoreCollection.updateOne(filter, updatedDoc);
    }
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteOption = async (req, res) => {
  try {
    const { category, id } = req.query || {};
    const filter = { _id: new ObjectId(id) };
    let result;
    if (category === "unipin") {
      result = await unipinCollection.deleteOne(filter);
    } else if (category === "idcode") {
      result = await idcodeCollection.deleteOne(filter);
    } else if (category === "weekly-monthly") {
      result = await weeklyMonthlyCollection.deleteOne(filter);
    } else if (category === "shell") {
      result = await shellCollection.deleteOne(filter);
    } else if (category === "airdrop") {
      result = await airdropCollection.deleteOne(filter);
    } else if (category === "lessIsMore") {
      result = await lessIsMoreCollection.deleteOne(filter);
    } else if (category === "recharge") {
      result = await rechargeCollection.deleteOne(filter);
    }
    // console.log(category, id, result);
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const deleteDynamicOption = async (req, res) => {
  try {
    const { id, index, name, price } = req.query;

    const service = await serviceCollection.findOne({ _id: new ObjectId(id) });
    if (!service) {
      return res.send({ success: false, message: "Service not found" });
    }
    if (!service.options || service.options.length === 0) {
      return res.send({ success: false, message: "No option found" });
    }
    const option = service.options[parseInt(index)];
    if (!option) {
      return res.send({ success: false, message: "Option not found" });
    }
    if (option.name !== name || option.price !== parseInt(price)) {
      return res.send({ success: false, message: "Invalid option" });
    }
    service.options.splice(parseInt(index), 1);
    const result = await serviceCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { options: service.options } }
    );
    res.send(result);
  } catch (err) {
    console.error("Error: ", err.message);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getOption,
  getAllOption,
  addOption,
  addDynamicOption,
  updateOption,
  updateDynamicOption,
  updateStock,
  deleteOption,
  deleteDynamicOption,
};
