const jwt = require("jsonwebtoken");
const { cookieOption } = require("../utils/cookieOption");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const { "access-token": token } = req.cookies;
  if (!token) {
    return res.status(401).send({ message: "not authorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res
        .cookie("access-token", "", cookieOption(0))
        .status(401)
        .send({ message: "unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

module.exports = { verifyToken };
