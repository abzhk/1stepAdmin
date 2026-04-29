import express from "express";
import { createRole,getRoles,updateRole } from "../controller/role.controller.js";
import { verifyAdminOrSuperAdmin, verifySuperAdminAccess } from "../rolevalidation/roleAccessMiddleware.js";
import { verifyAdminWithPermissions } from "../rolevalidation/roleAccessMiddleware.js";
import { MODULES, ACTIONS } from "../constants/permissions.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";
import { canAccess } from "../middlewares/permission.middleware.js";


const router = express.Router();

// router.post("/create",verifySuperAdminAccess, createRole);
router.get("/all",verifyAdminToken,canAccess(MODULES.SETTINGS, ACTIONS.READ), getRoles);


router.post(
  "/roles",
   verifyAdminToken,canAccess(MODULES.SETTINGS, ACTIONS.CREATE),
  createRole
);
router.put(
  "/:role",
  verifyAdminToken,canAccess(MODULES.SETTINGS, ACTIONS.UPDATE),
  updateRole
);

export default router;
