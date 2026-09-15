import express from 'express';
import {
  createAdmin,
  login,
  deleteProvider,
  updateProvider,
  logoutAdmin,
  getParentsAndProviders,
  deleteParent,
  updateParent,
  verifyAdminSession,
  getAdminProfile,
  updateAdminProfile,
  getAdminRoles,
} from '../controller/admin.controller.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';
import { verifyAdminOrSuperAdmin } from '../rolevalidation/roleAccessMiddleware.js';
import { canAccess } from "../middlewares/permission.middleware.js";
import { MODULES, ACTIONS } from "../constants/permissions.js";
import { validate } from "../validator/validate.middleware.js";
import { adminUpdateProviderSchema } from "../validator/schemas/adminProvider.schema.js";
import { adminUpdateParentSchema } from "../validator/schemas/adminParent.schema.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Admin router working");
});

router.post('/create-admin', createAdmin);
router.post('/login-admin', login);
router.post("/admin/logout", logoutAdmin);
router.get("/verify-token", verifyAdminSession);
router.get("/profile", verifyAdminToken, getAdminProfile);
router.put(
  "/update-profile",
  verifyAdminToken,
  canAccess(MODULES.SETTINGS, ACTIONS.UPDATE),
  updateAdminProfile
);

// Delete provider
router.delete("/providers/:providerId", deleteProvider);

// Update provider details by admin — Joi validation strips unknown fields & enforces business rules
router.put(
  "/providers/:providerId",
  verifyAdminToken,
  validate(adminUpdateProviderSchema),
  updateProvider
);

// Get providers and parents list for admin dashboard
router.get("/parents-providers/list", verifyAdminOrSuperAdmin, getParentsAndProviders);

// Delete parent
router.delete("/parent/user/:userRef", deleteParent);

// Update parent details — verifyAdminToken added (was missing), Joi validation added
router.put(
  "/parent/user/:userRef",
  verifyAdminToken,
  validate(adminUpdateParentSchema),
  updateParent
);

router.get("/getroles", verifyAdminToken, getAdminRoles);

export default router;