import express from 'express';
import {createAdmin,login,deleteProvider,
    updateProvider,
    logoutAdmin,
    getParentsAndProviders,
    deleteParent,updateParent,
    verifyAdminSession,
} from '../controller/admin.controller.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-admin',createAdmin)
router.post('/login-admin',login)
router.post("/admin/logout", logoutAdmin);
router.get("/verify-token", verifyAdminSession);


//delete provider
router.delete("/providers/:providerId", verifyAdminToken, deleteProvider);
//update provider details by admin
router.put("/providers/:providerId",verifyAdminToken,updateProvider);
//get provider and parent for admin 
router.get("/parents-providers/list",getParentsAndProviders);
//parent delete by admin
router.delete("/parent/user/:userRef", deleteParent);
//update parent detail
router.put("/parent/user/:userRef",  updateParent);

export default router;  