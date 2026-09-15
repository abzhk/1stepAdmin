import express from "express";
import {
  getProviders,
  getProviderById,
  getProviderStats,
  setProviderActiveStatus,
  getInactiveProviders,
  getCentreAppointments,
  getCentreStats,
  getIndividualProviders,
  getMonthlyAppointments,
  getCentreById,
  getCentreFullDetails,
  updateCentreByAdmin,
  setCentreActiveStatus,
  getInactiveCentres,
  deleteCentre,
  individualProvidersforAdmin,
} from "../controller/provider.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";
import { validate } from "../validator/validate.middleware.js";
import { adminUpdateCentreSchema } from "../validator/schemas/adminCentre.schema.js";

const router = express.Router();

router.get("/getProviders", verifyAdminToken, getProviders);

// Provider by id
router.get("/providersbyid/:id", verifyAdminToken, getProviderById);

// Provider stats
router.get("/getallbooking/:id", verifyAdminToken, getProviderStats);

// Activate / deactivate provider
router.put("/admin/provider/status", verifyAdminToken, setProviderActiveStatus);

// Inactive providers list
router.get("/inactive-providers", verifyAdminToken, getInactiveProviders);

// Centre appointments
router.get("/centre-appointments", verifyAdminToken, getCentreAppointments);

router.get("/centre-stats", verifyAdminToken, getCentreStats);
router.get("/individual-list", verifyAdminToken, getIndividualProviders);
router.get("/admin-individual-list", verifyAdminToken, individualProvidersforAdmin);

router.get("/appointments/monthly", verifyAdminToken, getMonthlyAppointments);

// Delete centre
router.delete("/centre/:id", verifyAdminToken, deleteCentre);

// Activate / deactivate centre
router.put("/centre/set-active-status", verifyAdminToken, setCentreActiveStatus);

// Inactive centres list
router.get("/centre/inactive-list", verifyAdminToken, getInactiveCentres);

router.get("/centre/:id", verifyAdminToken, getCentreById);

router.get("/centre-details/:id", verifyAdminToken, getCentreFullDetails);

// Update centre by admin — Joi validation strips unknown fields & enforces business rules
router.put(
  "/centre/:id",
  verifyAdminToken,
  validate(adminUpdateCentreSchema),
  updateCentreByAdmin
);

export default router;

