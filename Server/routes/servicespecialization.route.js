import express from "express";
import {
  createServiceSpecialization,
  getServiceSpecializations,
  getServiceSpecializationById,
  getSpecializationsByService,
  getServicesBySpecialization,
  updateServiceSpecialization,
  deleteServiceSpecialization,
} from "../controller/servicespecialization.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/",verifyAdminToken, createServiceSpecialization);

router.get("/", verifyAdminToken, getServiceSpecializations);

router.get("/service/:serviceId", verifyAdminToken, getSpecializationsByService);

router.get(
  "/specialization/:specializationId",
  verifyAdminToken,
  getServicesBySpecialization
);

router.get("/:id", verifyAdminToken, getServiceSpecializationById);

router.put("/:id", verifyAdminToken,   updateServiceSpecialization);

router.delete("/:id", verifyAdminToken, deleteServiceSpecialization);

export default router;