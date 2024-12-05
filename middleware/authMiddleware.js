const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  console.log("token", token);
  if (!token) {
    console.log("Token not found");
    return res.status(401).json({ message: "Not Authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded token:", decoded); 
    req.user = await userModel.findById(decoded.id);
    if (!req.user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid Token" });
    }
    next();
  } catch (err) {
    console.log("Token verification error:", err.message);
    res.status(401).json({ message: "Invalid Token" });
  }
};

const adminOnly = (req, res, next) => {
  
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json({ message: "Access Denied" });
};

module.exports = { protect, adminOnly };
