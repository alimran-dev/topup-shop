const { axiosAuto } = require("../utils/axiosAuto");

const getUsername = async (req, res) => {
  try {
    const { uid } = req.query || {};
    // console.log("uid",uid);
    const { data } = await axiosAuto.get("/nickname", { params: { uid } });
    // console.log("data",data);
    res.send(data);
  } catch (err) {
    console.error("getUsername: ", err?.message);
    res
      .status(500)
      .send("Internal Server Error");
  }
};


module.exports = {
  getUsername
};
