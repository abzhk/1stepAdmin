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
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── All routes require admin auth (applied once at the top) ───────────────────
router.use(verifyAdminToken);

// ─── Therapist-facing routes (proxied through admin server) ───────────────────
// These exist here because the admin backend shares the same DB.
// The 1stepdev server is the primary handler — these are for admin visibility only.
router.post("/init",           initClaim);
router.get("/me",              getMyClaim);
router.patch("/:id/profile",   saveProfileStep);
router.patch("/:id/submit",    submitClaim);

// ─── Admin review queue ───────────────────────────────────────────────────────
router.get("/admin/queue", getAdminClaimQueue);

// ─── Claim detail (MUST come before /:id/* routes to avoid conflicts) ─────────
router.get("/admin/:id", getAdminClaimDetail);

// ─── Document status update ────────────────────────────────────────────────────
router.patch("/admin/document/:docId/status", updateDocumentStatus);

// ─── Claim lifecycle actions ───────────────────────────────────────────────────
router.patch("/admin/:id/under-review", markUnderReview);
router.patch("/admin/:id/approve",      approveClaim);
router.patch("/admin/:id/reject",       rejectClaim);
router.patch("/admin/:id/review",       reviewClaimFinal);   // soft reject → fix_requested

// ─── Admin communication ──────────────────────────────────────────────────────
router.patch("/admin/:id/note",    addAdminNote);
router.post("/admin/:id/message",  sendMessageToApplicant);

export default router;
