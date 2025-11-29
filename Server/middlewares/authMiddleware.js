import jwt from "jsonwebtoken";
import Admin from "../model/adminmodel.js";

export const verifyAdminToken = async (req, res, next) => {
  try {
    let authHeader = req.headers.authorization;
    // console.log("Authorization header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }
    let token;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("_id username role");
    if (!admin) {
      return res.status(401).json({ message: "Admin not found or unauthorized" });
    }

    req.user = admin;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
