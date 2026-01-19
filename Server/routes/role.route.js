import express from "express";
import { createRole,getRoles } from "../controller/role.controller.js";

const router = express.Router();

router.post("/create", createRole);
router.get("/all", getRoles);

export default router;
