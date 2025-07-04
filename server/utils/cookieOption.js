const { CONSTANTS } = require('./constants');

require('dotenv').config();

const cookieOption = (age) => {
  const obj = {
    httpOnly: true,
    maxAge: age,
    secure: process.env.PROJECT_ENV !== "development",
    sameSite: process.env.PROJECT_ENV !== "development" ? "none" : "strict",
    domain:
      process.env.PROJECT_ENV !== "development"
        ? `.${CONSTANTS.domain}`
        : "localhost",
  };
  return obj;
};

module.exports = { cookieOption };
