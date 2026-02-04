import { verifyAdminToken } from "../middlewares/authMiddleware.js";
import { verifyRoles } from "../utils/verifyRoles.js";
import { canAccess } from "../middlewares/permission.middleware.js";
import { MODULES, ACTIONS, ROLES } from "../constants/permissions.js";

export const verifyAdminAccess = [
  verifyAdminToken,
  verifyRoles(ROLES.ADMIN),
];

export const verifySuperAdminAccess = [
  verifyAdminToken,
  verifyRoles(ROLES.SUPER_ADMIN),
];

export const verifyAdminOrSuperAdmin = [
  verifyAdminToken,
  verifyRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
];

export const verifyAdminWithPermissions = (module, action) => [
  verifyAdminToken,
  verifyRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  canAccess(module, action),
];
