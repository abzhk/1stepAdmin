import express from 'express';
import {
  searchAccessUsers,
  getParentAccess,
  getProviderAccess,
  updateUserOverride,
} from "../controller/access.controller.js";

const router = express.Router();

router.get("/search", searchAccessUsers);
router.get("/parent/:id", getParentAccess);
router.get("/provider/:id", getProviderAccess);
router.put("/user/:id/override", updateUserOverride);

export default router;