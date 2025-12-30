import {
  verifyToken,
  verifyRole,
  verifyPermission,
} from "../utils/verifyUser.js";

const roleAccessMiddleware = (role, permissions) => {
  return [verifyToken, verifyRole(role), verifyPermission(permissions)];
};

export const verifyProviderAccess = roleAccessMiddleware("Provider", [
  "provider_access",
]);
export const verifyParentAccess = roleAccessMiddleware("Parent", [
  "parent_access",
]);
