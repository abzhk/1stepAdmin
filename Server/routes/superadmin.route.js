import express from 'express';
import { createSuperAdmin } from "../controller/superadmin.controller.js";

const router = express.Router();

router.post("/create-superadmin", createSuperAdmin);

export default router;
