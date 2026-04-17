import express from "express";
import {
  initClaim,
  getMyClaim,
  saveProfileStep,
  submitClaim,
  getAdminClaimQueue,
  markUnderReview,
  approveClaim,
  rejectClaim,
  getAdminClaimDetail,
  updateDocumentStatus,
  reviewClaimFinal,
  addAdminNote,
  sendMessageToApplicant,
} from "../controller/claimProfile.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication

router.use(verifyAdminToken);

// ─── Therapist routes ─────────────────────────────────────────────────────────
router.post("/init",            initClaim);         // POST   /server/claim/init
router.get("/me",               getMyClaim);        // GET    /server/claim/me
router.patch("/:id/profile",    saveProfileStep);   // PATCH  /server/claim/:id/profile
router.patch("/:id/submit",     submitClaim);       // PATCH  /server/claim/:id/submit

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get("/admin/queue",               getAdminClaimQueue); // GET    /server/claim/admin/queue
router.patch("/admin/:id/under-review",  markUnderReview);   // PATCH  /server/claim/admin/:id/under-review
router.patch("/admin/:id/approve",       approveClaim);      // PATCH  /server/claim/admin/:id/approve
router.patch("/admin/:id/reject",        rejectClaim);       // PATCH  /server/claim/admin/:id/reject

router.get("/admin/:id", getAdminClaimDetail);

router.patch("/admin/document/:docId/status", updateDocumentStatus);
//final review
router.patch("/admin/:id/review", reviewClaimFinal);
//note
router.patch("/admin/:id/note", addAdminNote);
//mail
router.post("/admin/:id/message", sendMessageToApplicant);

export default router;
