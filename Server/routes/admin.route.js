import express from 'express';
import {createAdmin,login,deleteProvider,
    updateProvider,
    logoutAdmin,
    getParentsAndProviders,
    deleteParent,updateParent,
    verifyAdminSession,
    getAdminProfile,
    updateAdminProfile,
    getAdminRoles,
} from '../controller/admin.controller.js';
import { verifyAdminToken } from '../middlewares/authMiddleware.js';
import { verifyAdminOrSuperAdmin,verifySuperAdminAccess } from '../rolevalidation/roleAccessMiddleware.js';
import { canAccess } from "../middlewares/permission.middleware.js";
import { MODULES, ACTIONS } from "../constants/permissions.js";


const router = express.Router();
router.get("/", (req, res) => {
  res.send("Admin router working");
});

router.post('/create-admin',createAdmin)
router.post('/login-admin',login)
router.post("/admin/logout", logoutAdmin);
router.get("/verify-token",  verifyAdminSession);
router.get("/profile", verifyAdminToken, getAdminProfile);
router.put(
  "/update-profile",
  verifyAdminToken,
  canAccess(MODULES.SETTINGS, ACTIONS.UPDATE),
  updateAdminProfile
);


//delete provider
router.delete("/providers/:providerId",  deleteProvider);
//update provider details by admin
router.put("/providers/:providerId",verifyAdminToken,updateProvider);
//get provider and parent for admin 
router.get("/parents-providers/list",verifyAdminOrSuperAdmin, getParentsAndProviders);
//parent delete by admin
router.delete("/parent/user/:userRef", deleteParent);
//update parent detail
router.put("/parent/user/:userRef",  updateParent);

router.get("/getroles", verifyAdminToken, getAdminRoles);

export default router;  