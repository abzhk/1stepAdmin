import express from "express";
import {
  getAllTypes,
  getOptionsByType,
  createOption,
    updateOption,
    getAllOptionsByTypeAdmin,
    deleteOption,
    bulkToggleActive,
    reorderOptions,
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

router.delete ("/:id",verifyAdminToken, canAccess(MODULES.MASTER_DATA, ACTIONS.DELETE),deleteOption);
router.get("/admin/:type", verifyAdminToken,canAccess(MODULES.MASTER_DATA, ACTIONS.READ),getAllOptionsByTypeAdmin);

  router.patch("/reorder",verifyAdminToken,canAccess(MODULES.MASTER_DATA, ACTIONS.UPDATE),reorderOptions);

router.patch("/bulk-toggle",verifyAdminToken,canAccess(MODULES.MASTER_DATA, ACTIONS.UPDATE),bulkToggleActive);

export default router;
