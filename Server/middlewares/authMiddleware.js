import jwt from "jsonwebtoken";
import Admin from "../model/adminmodel.js";

export const verifyAdminToken = async (req, res, next) => {
  try {
    let token = req.cookies?.adminToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        } else {
          token = authHeader;
        }
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("_id username role");
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Admin not found or unauthorized" });
    }

    req.admin = {
      id: admin._id,
      username: admin.username,
      role: admin.role,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
