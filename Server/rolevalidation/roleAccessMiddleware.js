import { verifyAdminToken } from "../middlewares/authMiddleware.js";
import { verifyRoles } from "../utils/verifyRoles.js";
import { verifyPermissions } from "../utils/verifypermission.js";

export const verifyAdminAccess = [
  verifyAdminToken,verifyRoles("Admin"),
];

export const verifySuperAdminAccess = [
  verifyAdminToken, verifyRoles("SuperAdmin"),
];

export const verifyAdminOrSuperAdmin = [
  verifyAdminToken,verifyRoles("Admin", "SuperAdmin"),
];

export const verifyAdminWithPermissions = [
  verifyAdminToken,verifyRoles("Admin", "SuperAdmin"),verifyPermissions(["admin_access"]),
];
