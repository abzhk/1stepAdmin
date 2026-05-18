import express from "express";
import {
  createCategory,
  getAllCategories,
  deleteCategory,
  toggleCategory,
  adminGetAllAssessments,
  getProviderAssessmentbyId
} from "../controller/assessment.controller.js";

import { verifyAdminToken } from '../middlewares/authMiddleware.js';
import { canAccess } from "../middlewares/permission.middleware.js";
import { MODULES, ACTIONS } from "../constants/permissions.js";

const router = express.Router();

// CREATE
router.post(
  "/category",
  verifyAdminToken,
  canAccess(MODULES.ASSESSMENT, ACTIONS.CREATE),
  createCategory
);

// READ
router.get(
  "/category/getall",
  verifyAdminToken,
  canAccess(MODULES.ASSESSMENT, ACTIONS.READ),
  getAllCategories
);

// DELETE
router.delete(
  "/category/:id",
  verifyAdminToken,
  canAccess(MODULES.ASSESSMENT, ACTIONS.DELETE),
  deleteCategory
);

// UPDATE
router.put(
  "/category/toggle/:id",
  verifyAdminToken,
  canAccess(MODULES.ASSESSMENT, ACTIONS.UPDATE),
  toggleCategory
);

// READ ALL
router.get(
  "/admin/allassessments",
  verifyAdminToken,
  canAccess(MODULES.ASSESSMENT, ACTIONS.READ),
  adminGetAllAssessments
);


router.get("/getassessment/:providerId", getProviderAssessmentbyId);

export default router;