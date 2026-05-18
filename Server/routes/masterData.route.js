import express from "express";
import {
  getAllTypes,
  getOptionsByType,
  createOption,
    updateOption,
    getAllOptionsByTypeAdmin
} from "../controller/masterController/masterData.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";
import { canAccess } from "../middlewares/permission.middleware.js";
import { MODULES, ACTIONS } from "../constants/permissions.js";

const router = express.Router();

router.get("/types",verifyAdminToken,canAccess(MODULES.MASTER_DATA, ACTIONS.READ), getAllTypes); // get all available types
router.get("/:type",verifyAdminToken, canAccess(MODULES.MASTER_DATA, ACTIONS.READ), getOptionsByType); // get options by type

router.post("/",verifyAdminToken,canAccess(MODULES.MASTER_DATA, ACTIONS.CREATE), createOption);

// UPDATE
router.put("/:id",verifyAdminToken, canAccess(MODULES.MASTER_DATA, ACTIONS.UPDATE),updateOption);
router.get("/admin/:type", verifyAdminToken,
  canAccess(MODULES.MASTER_DATA, ACTIONS.READ),getAllOptionsByTypeAdmin);

export default router;
