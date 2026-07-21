import express from "express";
import {
  createSpecialization,
  getSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
} from "../controller/specialization.controller.js";

const router = express.Router();

router.post("/", createSpecialization);
router.get("/", getSpecializations);
router.get("/:id", getSpecializationById);
router.put("/:id", updateSpecialization);
router.delete("/:id", deleteSpecialization);

export default router;