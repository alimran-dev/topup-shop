const verifyAutoServer = (req, res, next) => {
  try {
    const token = req.headers?.authorization?.substring(7);
    if (!token) {
      return res.status(401).send({ message: "No token provided" });
    }

    if (token !== process.env.AUTO_SERVER_API_KEY) {
      return res.status(403).send({ message: "Invalid token" });
    }
    next();
  } catch (err) {
    console.error("Error in verifyToken middleware:", err.message);
    return res.status(500).send({ message: "Internal server error" });
  }
};
