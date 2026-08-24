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

const router = express.Router();

router.post("/", createServiceSpecialization);

router.get("/", getServiceSpecializations);

router.get("/service/:serviceId", getSpecializationsByService);

router.get(
  "/specialization/:specializationId",
  getServicesBySpecialization
);

router.get("/:id", getServiceSpecializationById);

router.put("/:id", updateServiceSpecialization);

router.delete("/:id", deleteServiceSpecialization);

export default router;