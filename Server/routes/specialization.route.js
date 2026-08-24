import express from "express";
import {
  createSpecialization,
  getSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
  getSpecializationsWithPagination,
} from "../controller/specialization.controller.js";

const router = express.Router();

router.post("/", createSpecialization);

// GET ALL
router.get("/", getSpecializations);

// GET WITH PAGINATION
router.get("/pagination", getSpecializationsWithPagination);

// GET BY ID
router.get("/:id", getSpecializationById);

// UPDATE
router.put("/:id", updateSpecialization);

// DELETE
router.delete("/:id", deleteSpecialization);

export default router;