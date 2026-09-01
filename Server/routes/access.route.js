import express from 'express';
import {
  searchAccessUsers,
  getParentAccess,
  getProviderAccess,
  updateUserOverride,
} from "../controller/access.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/search", verifyAdminToken, searchAccessUsers);
router.get("/parent/:id", verifyAdminToken, getParentAccess);
router.get("/provider/:id", verifyAdminToken, getProviderAccess);
router.put("/user/:id/override", verifyAdminToken, updateUserOverride);

export default router;