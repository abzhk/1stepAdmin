import express from "express";
import { createRole,getRoles,updateRole } from "../controller/role.controller.js";
import { verifySuperAdminAccess } from "../rolevalidation/roleAccessMiddleware.js";
import { verifyAdminWithPermissions } from "../rolevalidation/roleAccessMiddleware.js";
import { MODULES, ACTIONS } from "../constants/permissions.js";


const router = express.Router();

// router.post("/create",verifySuperAdminAccess, createRole);
router.get("/all",verifySuperAdminAccess, getRoles);


router.post(
  "/roles",
   ...verifyAdminWithPermissions(MODULES.SETTINGS, ACTIONS.UPDATE),
  createRole
);
router.put(
  "/:role",
  ...verifyAdminWithPermissions(MODULES.SETTINGS, ACTIONS.UPDATE),
  updateRole
);

export default router;
