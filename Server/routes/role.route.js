import express from "express";
import { createRole,getRoles } from "../controller/role.controller.js";
import { verifySuperAdminAccess } from "../rolevalidation/roleAccessMiddleware.js";

const router = express.Router();

router.post("/create",verifySuperAdminAccess, createRole);
router.get("/all", getRoles);

export default router;
