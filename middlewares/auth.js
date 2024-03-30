const jwt = require("jsonwebtoken");
const User = require("../services/schemas/UserSchema");
require("dotenv").config();

const { SECRET } = process.env;

const auth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.id;

    const user = await User.findById(decoded.id);

    if (!user || token !== user.token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next(error);
  }
};

module.exports = { auth };
