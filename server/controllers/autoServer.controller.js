const { axiosAuto } = require("../utils/axiosAuto");

const getUsername = async (req, res) => {
  try {
    const { uid } = req.query || {};
    const { data } = await axiosAuto.get("/nickname", { params: { uid } });
    res.send(data);
  } catch (err) {
    console.error("getUsername: ", err?.message);
    res
      .status(500)
      .send("Internal Server Error");
  }
};

const getShopStatus = async (req, res) => {
  try {
    const response = await axiosAuto.get("/status/31e9e9e5-f1ad-4893-9f8c-5dbca98aee11");
    res.send(response.data);
  } catch (err) {
    console.error("Error fetching shop status: ", err.message);
    res.status(500).send({ status: "error", message: "Failed to fetch shop status" });
  }
};


module.exports = {
  getUsername,
  getShopStatus
};
