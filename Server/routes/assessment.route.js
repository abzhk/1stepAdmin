import express from "express";
import { createCategory,
     getAllCategories,
     deleteCategory,
     toggleCategory ,
     adminGetAllAssessments,
getProviderAssessmentbyId}
      from "../controller/assessment.controller.js";
import {verifyAdminToken} from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post("/category", createCategory);
router.get("/category/getall", getAllCategories);
router.delete("/category/:id", deleteCategory);
router.put("/category/toggle/:id", toggleCategory);

router.get("/admin/allassessments",verifyAdminToken,adminGetAllAssessments);

router.get("/getassessment/:providerId",getProviderAssessmentbyId)


export default router;


