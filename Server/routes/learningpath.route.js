import express from "express";
import { 
    createLearningPath,
     deleteLearningPath,
      getAllLearningPaths,
       getLearningPath, 
       getLearningPathById, 
       updateLearningPath
     } from "../controller/LearningPath.controller.js";

const router = express.Router();


router.get("/all", getAllLearningPaths);
router.get("/edit/:id", getLearningPathById);
router.get("/:id", getLearningPath);
router.post("/add", createLearningPath);
router.put("/:id", updateLearningPath);
router.delete("/:id", deleteLearningPath);

export default router;