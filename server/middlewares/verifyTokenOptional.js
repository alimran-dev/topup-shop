const jwt = require("jsonwebtoken");
require("dotenv").config();

// Like verifyToken, but never rejects: guests pass through without req.user.
// Used on public catalog endpoints so logged-in users can be served
// subscriber prices without breaking anonymous browsing.
const verifyTokenOptional = (req, res, next) => {
  const { "access-token": token } = req.cookies;
  if (!token) return next();
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // An invalid/expired cookie is treated as "guest" — never block browsing.
    if (!err) req.user = decoded;
    next();
  });
};

module.exports = { verifyTokenOptional };
