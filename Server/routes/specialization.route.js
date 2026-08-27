import express from "express";
import {
  createSpecialization,
  getSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
  getSpecializationsWithPagination,
} from "../controller/specialization.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/",verifyAdminToken, createSpecialization);

// GET ALL
router.get("/",verifyAdminToken, getSpecializations);

// GET WITH PAGINATION
router.get("/pagination", verifyAdminToken, getSpecializationsWithPagination);

// GET BY ID
router.get("/:id", verifyAdminToken, getSpecializationById);

// UPDATE
router.put("/:id", verifyAdminToken, updateSpecialization);

// DELETE
router.delete("/:id", verifyAdminToken, deleteSpecialization);

export default router;