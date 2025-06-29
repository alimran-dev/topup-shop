const axios = require("axios");
require("dotenv").config();
const {axiosAuto} = require("../utils/axiosAuto")

const getUsername = async (req, res) => {
  try {
    const { uid } = req.query || {};
    // console.log(uid);
    const { data } = await axiosAuto.get("/username",{ params: { uid } });
    res.send(data);
  } catch (err) {
    console.error("getUsername: ", err.message);
    console.log("status: ", err?.response?.status, "data", err?.response?.data);
    res
      .status(err?.response?.status || 500)
      .send(err?.response?.data || "Internal Server Error");
  }
};

const getUnipinsData = async (req, res) => {
  try {
    const { data } = await axiosAuto.get("/unipins-data");
    res.send(data);
  } catch (err) {
    console.error("getUnipinsData: ", err.message);
    console.log(
      "status: ".err?.response?.status,
      "data: ",
      err?.response?.data
    );
    res
      .status(err?.response?.status || 500)
      .send(err?.response?.data || "Internal Server Error");
  }
};

const getOrderInfo = async (req, res) => {
  try {
    const {id}=req.query || {};
    const { data } = await axiosAuto.get("/order-info",{params: {id}});
    res.send(data);
  } catch (err) {
    console.error("getOrderInfo: ", err.message);
    console.log(
      "status: ".err?.response?.status,
      "data: ",
      err?.response?.data
    );
    res
      .status(err?.response?.status || 500)
      .send(err?.response?.data || "Internal Server Error");
  }
};

const newOrder = async (req, res) => {
  try {
  } catch (err) {
    console.error("newOrder: ", err.message);
    res.status(500).send("Internal Server Error");
  }
};

const addUnipinsToAuto = async (req, res) => {
  try {
    const codesArray = req.body || {};
    // console.log(codesArray);
    const {data}=await axiosAuto.post("/add-unipins",{codesArray});
    res.send(data);
  } catch (err) {
    console.error("addUnipinsToAuto: ", err.message);
        console.log(
      "status: ".err?.response?.status,
      "data: ",
      err?.response?.data
    );
    res
      .status(err?.response?.status || 500)
      .send(err?.response?.data || "Internal Server Error");
  }
};

module.exports = {
  getUsername,
  getUnipinsData,
  getOrderInfo,
  newOrder,
  addUnipinsToAuto,
};
