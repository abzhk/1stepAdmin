import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    if (!token)
      return next(
        errorHandler(401, "Session Expired!, Refresh the page.")
      );

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return next(errorHandler(403, "Token is not valid!"));
      req.user = user;
      next();
    });
  } catch (error) {
    return next(errorHandler(401, "Error verifying token, try later."));
  }
};

export const verifyPermission =
  (requiredPermissions = []) =>
  (req, res, next) => {
    if (!req.user) {
      return next(errorHandler(401, "User not authentication"));
    }

    const hasPermission = requiredPermissions.every((permission) =>
      req.user.permissions?.includes(permission)
    );
    if (!hasPermission) {
      return res.status(403).json({
        message: "Access denied!, Logout and try later",
        success: false,
      });
    }
    next();
  };

export const verifyRole = (permissions) => (req, res, next) => {
  const { role } = req.user;

  if (role !== permissions) {
    return res.status(403).json({ message: "Access denied: Incorrect Role" });
  }
  next();
};

export const verifyAdmin = (req, res, next) => {
  const admin = req.cookies.access_token;
  if (!admin.isAdmin) {
    return next(errorHandler(401, "You are not authenticated!"));
  }
  next();
};
