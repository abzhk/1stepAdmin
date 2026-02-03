import express from "express";
import { createRole,getRoles } from "../controller/role.controller.js";
import { verifySuperAdminAccess } from "../rolevalidation/roleAccessMiddleware.js";
import { verifyAdminWithPermissions } from "../rolevalidation/roleAccessMiddleware.js";
import { MODULES, ACTIONS } from "../constants/permissions.js";


const router = express.Router();

// router.post("/create",verifySuperAdminAccess, createRole);
router.get("/all", getRoles);


router.post(
  "/roles",
  ...verifyAdminWithPermissions(MODULES.SETTINGS, ACTIONS.CREATE),
  createRole
);


export default router;
