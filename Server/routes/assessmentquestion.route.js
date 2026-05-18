import express from "express";

import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  addQuestion,
  getQuestionsByAssessment,
   updateQuestion,
   deleteQuestion,
    publishAssessmentVersion,
    bulkImportQuestions,
} from "../controller/Assessment/assessment.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";
import { canAccess } from "../middlewares/permission.middleware.js";
import { MODULES, ACTIONS } from "../constants/permissions.js";
import { upload } from "../middlewares/upload.js";


const router = express.Router();



// Create
router.post("/create",verifyAdminToken, canAccess(MODULES.ASSESSMENT, ACTIONS.CREATE),createAssessment);

// Get all
router.get("/get-assessment",verifyAdminToken, canAccess(MODULES.ASSESSMENT, ACTIONS.READ), getAssessments);

// Get one
router.get("/get-by/:id",verifyAdminToken, canAccess(MODULES.ASSESSMENT, ACTIONS.READ), getAssessmentById);

// Update
router.put("/assessment/:id",verifyAdminToken, canAccess(MODULES.ASSESSMENT, ACTIONS.UPDATE), updateAssessment);

// Delete
router.delete("/assessment/:id",verifyAdminToken, canAccess(MODULES.ASSESSMENT, ACTIONS.DELETE), deleteAssessment);

router.post(
  "/assessment/:id/publish-version",
  verifyAdminToken,
  publishAssessmentVersion
);

// QUESTIONS


// Add question
router.post("/addquestions", verifyAdminToken, canAccess(MODULES.ASSESSMENT, ACTIONS.CREATE), addQuestion);

// Get questions by assessment
router.get("/assessment/:id/questions", verifyAdminToken, canAccess(MODULES.ASSESSMENT, ACTIONS.READ), getQuestionsByAssessment);

router.put("/edit-assessment/:id", verifyAdminToken, canAccess(MODULES.ASSESSMENT, ACTIONS.UPDATE), updateQuestion);
router.delete("/assessment/questions/:id", verifyAdminToken, canAccess(MODULES.ASSESSMENT, ACTIONS.DELETE), deleteQuestion);


//bulk-upload questions
router.post("/bulk-import",upload.single("file"),bulkImportQuestions);


export default router;