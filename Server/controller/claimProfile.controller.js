/**
 * ClaimProfile Controller
 *
 * Manages the Therapist Profile Claim lifecycle:
 * draft → submitted → under_review → approved | rejected
 *
 * Endpoints:
 *   POST   /server/claim/init                    — Create or fetch draft claim
 *   GET    /server/claim/me                      — Get own claim + profile
 *   PATCH  /server/claim/:id/profile             — Save profile step
 *   PATCH  /server/claim/:id/submit              — Submit for review
 *   GET    /server/claim/admin/queue             — Admin: get review queue
 *   PATCH  /server/claim/admin/:id/under-review  — Admin: start review
 *   PATCH  /server/claim/admin/:id/approve       — Admin: approve claim
 *   PATCH  /server/claim/admin/:id/reject        — Admin: reject claim
 */

import {
  TherapistClaimRequest,
  TherapistProfile,
  ClaimAuditLog,
  TherapistDocument,
  TherapistIdentityVerification,
  TherapistPaymentDetail,
} from "../model/ClaimProfile/index.js";
import { sendEmail } from "../services/email.services.js";
import { errorHandler } from "../utils/error.js";
import NotificationService from "../services/notification.service.js";
import { getSignedUrl } from "../config/firebaseAdmin.js";
import crypto from "crypto";

// ─── Helper: record audit log ────────────────────────────────────────────────
const audit = async ({ claimId, userId, performedBy, action, previousStatus, newStatus, req, metadata = {} }) => {
  try {
    const rawIp = req?.ip || req?.headers?.["x-forwarded-for"] || "unknown";
    const hashedIp = rawIp !== "unknown"
      ? crypto.createHmac("sha256", process.env.JWT_SECRET || "salt").update(rawIp).digest("hex")
      : null;

    await ClaimAuditLog.create({
      claimId,
      userId,
      performedBy,
      action,
      previousStatus,
      newStatus,
      hashedIp,
      userAgent: req?.headers?.["user-agent"]?.slice(0, 200) || null,
      metadata,
    });
  } catch (err) {
    console.error("[ClaimAudit] Failed to write audit log:", err.message);
  }
};

// ─── POST /server/claim/init ─────────────────────────────────────────────────
// Create (idempotent) a draft claim for the authenticated user
export const initClaim = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Return existing non-rejected claim if one exists
    let claim = await TherapistClaimRequest.findOne({
      userId,
      status: { $ne: "rejected" },
    });

    if (!claim) {
      claim = await TherapistClaimRequest.create({ userId });

      await audit({
        claimId: claim._id,
        userId,
        performedBy: userId,
        action: "claim_created",
        previousStatus: null,
        newStatus: "draft",
        req,
      });
    }

    // Fetch or initialise therapist profile
    let profile = await TherapistProfile.findOne({ claimId: claim._id });
    if (!profile) {
      profile = await TherapistProfile.create({ userId, claimId: claim._id });
    }

    res.status(200).json({ success: true, claim, profile });
  } catch (error) {
    next(error);
  }
};

// ─── GET /server/claim/me ────────────────────────────────────────────────────
export const getMyClaim = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const claim = await TherapistClaimRequest.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!claim) {
      return res.status(200).json({ success: true, claim: null, profile: null });
    }

    const profile = await TherapistProfile.findOne({ claimId: claim._id }).lean();

    res.status(200).json({ success: true, claim, profile });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /server/claim/:id/profile ────────────────────────────────────────
// Save progress on any claim step (idempotent partial update)
export const saveProfileStep = async (req, res, next) => {
  try {
    const { id: claimId } = req.params;
    const userId = req.user.id;

    const claim = await TherapistClaimRequest.findOne({ _id: claimId, userId });
    if (!claim) return next(errorHandler(404, "Claim not found"));
    if (claim.isLocked) return next(errorHandler(400, "Claim is locked after submission"));

    // Only update provided fields (dot-notation safe using $set)
    const allowedFields = ["email", "qualifications", "practice", "profileCompletionScore"];
    const updatePayload = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updatePayload[field] = req.body[field];
      }
    }

    if (req.body.completionFlags) {
      const flags = req.body.completionFlags;
      const flagUpdates = {};
      for (const [key, val] of Object.entries(flags)) {
        flagUpdates[`completionFlags.${key}`] = val;
      }
      Object.assign(updatePayload, flagUpdates);
    }

    const profile = await TherapistProfile.findOneAndUpdate(
      { claimId },
      { $set: updatePayload },
      { new: true, upsert: true }
    );

    await audit({
      claimId,
      userId,
      performedBy: userId,
      action: "step_saved",
      req,
      metadata: { updatedFields: Object.keys(updatePayload) },
    });

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /server/claim/:id/submit ─────────────────────────────────────────
// Therapist submits claim for admin review
export const submitClaim = async (req, res, next) => {
  try {
    const { id: claimId } = req.params;
    const userId = req.user.id;
    const io = req.app.get("io");

    const claim = await TherapistClaimRequest.findOne({ _id: claimId, userId });
    if (!claim) return next(errorHandler(404, "Claim not found"));
    if (claim.status === "submitted" || claim.status === "under_review") {
      return next(errorHandler(400, "Claim already submitted"));
    }
    if (claim.status === "approved") {
      return next(errorHandler(400, "Claim already approved"));
    }

    const previousStatus = claim.status;
    claim.status      = "submitted";
    claim.submittedAt = new Date();
    claim.isLocked    = true;
    claim.version     = (claim.version || 1) + (previousStatus === "rejected" ? 1 : 0);
    await claim.save();

    await audit({
      claimId,
      userId,
      performedBy: userId,
      action: "claim_submitted",
      previousStatus,
      newStatus: "submitted",
      req,
    });

    // Notifications: therapist receives confirmation + admins notified
    await NotificationService.sendClaimNotification(io, {
      claimRequest: claim,
      status: "submitted",
      recipientId: userId,
    });

    res.status(200).json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};

// ─── GET /server/claim/admin/queue ───────────────────────────────────────────
// Admin: paginated review queue
export const getAdminClaimQueue = async (req, res, next) => {
  try {
    if (!req.user.isAdmin && !req.user.role?.isSuperAdmin) {
      return next(errorHandler(403, "Admin access required"));
    }

    const status = req.query.status || "submitted";
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;

    const filter = {
  status: { $ne: "draft" },
};

if (req.query.status && req.query.status !== "all") {
  filter.status = req.query.status;
}

    const [claims, total] = await Promise.all([
      TherapistClaimRequest.find(filter)
        .sort({ submittedAt: 1 })   // oldest first (FIFO)
        .skip(skip)
        .limit(limit)
        .populate("userId", "username email profilePicture")
        .populate("reviewedBy", "username email")
        .lean(),
      TherapistClaimRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: claims,
      pagination: { page, limit, total, hasMore: skip + claims.length < total },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /server/claim/admin/:id/under-review ──────────────────────────────
// Admin: mark as under review
export const markUnderReview = async (req, res, next) => {
  try {
    if (!req.user.isAdmin && !req.user.role?.isSuperAdmin) {
      return next(errorHandler(403, "Admin access required"));
    }

    const claim = await TherapistClaimRequest.findById(req.params.id);
    if (!claim) return next(errorHandler(404, "Claim not found"));
    if (claim.status !== "submitted") {
      return next(errorHandler(400, "Only submitted claims can be put under review"));
    }

    const io = req.app.get("io");
    const previousStatus = claim.status;
    claim.status     = "under_review";
    claim.reviewedBy = req.user.id;
    claim.reviewedAt = new Date();
    await claim.save();

    await audit({
      claimId: claim._id,
      userId: claim.userId,
      performedBy: req.user.id,
      action: "review_started",
      previousStatus,
      newStatus: "under_review",
      req,
    });

    await NotificationService.sendClaimNotification(io, {
      claimRequest: claim,
      status: "under_review",
      recipientId: claim.userId.toString(),
    });

    res.status(200).json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /server/claim/admin/:id/approve ──────────────────────────────────
export const approveClaim = async (req, res, next) => {
  try {
    if (!req.user.isAdmin && !req.user.role?.isSuperAdmin) {
      return next(errorHandler(403, "Admin access required"));
    }

    const claim = await TherapistClaimRequest.findById(req.params.id);
    if (!claim) return next(errorHandler(404, "Claim not found"));
    if (!["submitted", "under_review"].includes(claim.status)) {
      return next(errorHandler(400, "Claim cannot be approved in its current state"));
    }

    const io = req.app.get("io");
    const previousStatus = claim.status;
    claim.status      = "approved";
    claim.reviewedBy  = req.user.id;
    claim.approvedAt  = new Date();
    claim.reviewedAt  = new Date();
    claim.isLocked    = true;
    await claim.save();

    await audit({
      claimId: claim._id,
      userId: claim.userId,
      performedBy: req.user.id,
      action: "claim_approved",
      previousStatus,
      newStatus: "approved",
      req,
    });

    await NotificationService.sendClaimNotification(io, {
      claimRequest: claim,
      status: "approved",
      recipientId: claim.userId.toString(),
    });

    res.status(200).json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /server/claim/admin/:id/reject ───────────────────────────────────
export const rejectClaim = async (req, res, next) => {
  try {
    if (!req.user.isAdmin && !req.user.role?.isSuperAdmin) {
      return next(errorHandler(403, "Admin access required"));
    }

    const { rejectionReason, rejectionCategory, adminNotes } = req.body;
    if (!rejectionReason) {
      return next(errorHandler(400, "Rejection reason is required"));
    }

    const claim = await TherapistClaimRequest.findById(req.params.id);
    if (!claim) return next(errorHandler(404, "Claim not found"));
    if (!["submitted", "under_review"].includes(claim.status)) {
      return next(errorHandler(400, "Claim cannot be rejected in its current state"));
    }

    const io = req.app.get("io");
    const previousStatus = claim.status;
    claim.status            = "rejected";
    claim.reviewedBy        = req.user.id;
    claim.reviewedAt        = new Date();
    claim.rejectionReason   = rejectionReason;
    claim.rejectionCategory = rejectionCategory || "other";
    claim.isLocked          = false; // allow resubmission
    if (adminNotes) claim.adminNotes = adminNotes;
    await claim.save();

    await audit({
      claimId: claim._id,
      userId: claim.userId,
      performedBy: req.user.id,
      action: "claim_rejected",
      previousStatus,
      newStatus: "rejected",
      req,
      metadata: { rejectionCategory, rejectionReason },
    });

    await NotificationService.sendClaimNotification(io, {
      claimRequest: claim,
      status: "rejected",
      recipientId: claim.userId.toString(),
      rejectionReason,
    });

    res.status(200).json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};
//get detail for admin verify
export const getAdminClaimDetail = async (req, res, next) => {
  try {
    const claimId = req.params.id;

    const claim = await TherapistClaimRequest.findById(claimId)
      .populate("userId", "username email");

    if (!claim) {
      return next(errorHandler(404, "Claim not found"));
    }

   const [profile, rawDocuments, identity, payment, auditLogs] =
  await Promise.all([
    TherapistProfile.findOne({ claimId }),
    TherapistDocument.find({ claimId }),
    TherapistIdentityVerification.findOne({ claimId }),
    TherapistPaymentDetail.findOne({ claimId }),
    ClaimAuditLog.find({ claimId }).sort({ createdAt: -1 }),
  ]);

const documents = await Promise.all(
  rawDocuments.map(async (doc) => {
    let downloadUrl = null;

    try {
      downloadUrl = await getSignedUrl(doc.fileRef);
    } catch (err) {
      console.error("Firebase URL generation failed:", err.message);
    }

    return {
      ...doc.toObject(),
      downloadUrl,
    };
  })
);

    res.status(200).json({
      success: true,
      data: {
        claim,
        profile,
        documents,
        identity,
        payment,
        auditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

//update doc status 

export const updateDocumentStatus = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { status, rejectionReason } = req.body;

    const allowedStatuses = ["pending", "verified", "failed"];

    if (!allowedStatuses.includes(status)) {
      return next(errorHandler(400, "Invalid document status"));
    }

    const updatedDoc = await TherapistDocument.findByIdAndUpdate(
      docId,
      {
        $set: {
          docStatus: status,
          docRejectionReason:
            status === "failed" ? rejectionReason || null : null,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedDoc) {
      return next(errorHandler(404, "Document not found"));
    }

    res.status(200).json({
      success: true,
      message: "Document status updated successfully",
      document: updatedDoc,
    });
  } catch (error) {
    next(error);
  }
};

//final review by Admin
export const reviewClaimFinal = async (req, res, next) => {
  try {
    if (!req.user.isAdmin && !req.user.role?.isSuperAdmin) {
      return next(errorHandler(403, "Admin access required"));
    }

    const { id } = req.params;
    const { action, reason, category } = req.body;

    const allowedActions = [
      "approve",
      "request_fix",
      "reject",
      "reopen",
    ];

    if (!allowedActions.includes(action)) {
      return next(errorHandler(400, "Invalid action"));
    }

    const claim = await TherapistClaimRequest.findById(id);

    if (!claim) {
      return next(errorHandler(404, "Claim not found"));
    }

    if (
      action !== "reopen" &&
      !["submitted", "under_review"].includes(claim.status)
    ) {
      return next(
        errorHandler(400, "Claim cannot be reviewed in current state")
      );
    }

    const previousStatus = claim.status;

  if (action === "approve") {
  const totalDocs = await TherapistDocument.countDocuments({
    claimId: id,
    isActive: true,
  });

  if (totalDocs === 0) {
    return next(
      errorHandler(400, "No documents uploaded. Cannot approve claim.")
    );
  }

  const unverifiedDocs = await TherapistDocument.countDocuments({
    claimId: id,
    isActive: true,
    docStatus: { $ne: "verified" },
  });

  if (unverifiedDocs > 0) {
    return next(
      errorHandler(400, "All documents must be verified before approval")
    );
  }

  claim.status = "approved";
  claim.approvedAt = new Date();
  claim.isLocked = true;
  claim.rejectionReason = null;
  claim.rejectionCategory = null;
}

 
    if (action === "request_fix") {
      if (!reason?.trim()) {
        return next(errorHandler(400, "Reason required"));
      }

      claim.status = "fix_requested";
      claim.isLocked = false;
      claim.rejectionReason = reason.trim();
      claim.rejectionCategory = category || "fix_required";
    }


    if (action === "reject") {
      if (!reason?.trim()) {
        return next(errorHandler(400, "Reason required"));
      }

      claim.status = "rejected";
      claim.isLocked = false;
      claim.rejectionReason = reason.trim();
      claim.rejectionCategory = category || "other";
    }


    if (action === "reopen") {
      if (!["approved", "rejected", "fix_requested"].includes(claim.status)) {
        return next(
          errorHandler(400, "Only approved/rejected/fix requested claims can be reopened")
        );
      }

      claim.status = "under_review";
      claim.isLocked = false;
      claim.rejectionReason = reason?.trim() || null;
      claim.rejectionCategory = null;
      claim.approvedAt = null;
    }

    claim.reviewedBy = req.user.id;
    claim.reviewedAt = new Date();

    await claim.save();

    await audit({
      claimId: claim._id,
      userId: claim.userId,
      performedBy: req.user.id,
      action:
        action === "approve"
          ? "claim_approved"
          : action === "request_fix"
          ? "claim_fix_requested"
          : action === "reject"
          ? "claim_rejected"
          : "claim_reopened",
      previousStatus,
      newStatus: claim.status,
      req,
      metadata: {
        reason,
        category,
      },
    });

    res.status(200).json({
      success: true,
      message: `Claim ${action} completed successfully`,
      claim,
    });
  } catch (error) {
    next(error);
  }
};
//admin noted

export const addAdminNote = async (req, res, next) => {
  try {
    if (!req.user.isAdmin && !req.user.role?.isSuperAdmin) {
      return next(errorHandler(403, "Admin access required"));
    }

    const { id } = req.params;
    const { note } = req.body;

    if (!note?.trim()) {
      return next(errorHandler(400, "Note is required"));
    }

    const claim = await TherapistClaimRequest.findById(id);

    if (!claim) {
      return next(errorHandler(404, "Claim not found"));
    }

    claim.adminNotes = note.trim();
    await claim.save();

    await audit({
      claimId: claim._id,
      userId: claim.userId,
      performedBy: req.user.id,
      action: "admin_note_added",
      previousStatus: claim.status,
      newStatus: claim.status,
      req,
      metadata: {
        note,
      },
    });

    res.status(200).json({
      success: true,
      message: "Note saved successfully",
      adminNotes: claim.adminNotes,
    });
  } catch (error) {
    next(error);
  }
};
//send mail

export const sendMessageToApplicant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { channel, message } = req.body;

    if (!message?.trim()) {
      return next(errorHandler(400, "Message is required"));
    }

    const claim = await TherapistClaimRequest.findById(id)
      .populate("userId", "email username phone");

    if (!claim) {
      return next(errorHandler(404, "Claim not found"));
    }

    if (channel === "email") {
      await sendEmail({
        to: claim.userId.email,
        subject: "Regarding your verification",
        html: `<p>Hi ${claim.userId.username},</p><p>${message}</p>`,
      });
    }

    await audit({
      claimId: claim._id,
      userId: claim.userId._id,
      performedBy: req.user.id,
      action: "admin_message_sent",
      req,
      metadata: { channel, message },
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (err) {
    next(err);
  }
};