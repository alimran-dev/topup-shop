const { dbCollections } = require("../config/db");

const getServices = async(req, res)=>{
    try {
        const result = await dbCollections.serviceCollection.find().toArray();
        res.send(result);
    } catch (error) {
        console.log(error.message || error);
        res.send(error.message || error)
    }
}

const postService = async (req, res) => {
    const data = req.body;
    try {
        const result = await dbCollections.serviceCollection.insertOne(data);
        res.send(result);
    } catch (error) {
        console.log(error.message || error);
        res.send(error.message || error);
    }
}
module.exports = {getServices, postService};