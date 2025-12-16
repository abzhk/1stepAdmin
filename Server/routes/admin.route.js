import express from 'express';
import {createAdmin,loginAdmin,deleteProvider,updateProvider,logoutAdmin} from '../controller/admin.controller.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-admin',createAdmin)
router.post('/login-admin',verifyAdminToken,loginAdmin)
router.post("/admin/logout", logoutAdmin);


//delete provider
router.delete("/providers/:providerId", verifyAdminToken, deleteProvider);
router.put("/providers/:providerId",verifyAdminToken,updateProvider);

export default router;  