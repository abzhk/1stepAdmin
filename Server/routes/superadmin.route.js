import express from 'express';
import { createSuperAdmin ,loginSuperAdmin} from "../controller/superadmin.controller.js";

const router = express.Router();

router.post("/create-superadmin", createSuperAdmin);
router.post("/login-superadmin", loginSuperAdmin);

export default router;
