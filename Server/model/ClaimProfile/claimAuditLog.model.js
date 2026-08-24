import mongoose from "mongoose";

const claimAuditLogSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TherapistClaimRequest",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // could be the therapist or an admin
    },

    action: {
      type: String,
      enum: [
        "claim_created",
        "step_saved",
        "document_uploaded",
        "claim_submitted",
        "review_started",
        "claim_approved",
        "claim_rejected",
        "claim_fix_requested",      // written by this app's reviewClaimFinal
        "claim_reopened",
        "claim_reapplied",          // written by 1stepdev's reapplyClaim
        "claim_resubmitted",
        "admin_note_added",
        "admin_message_sent",       // written by sendMessageToApplicant
        "document_viewed_by_user",
      ],
      required: true,
    },

    previousStatus: { type: String, default: null },
    newStatus: { type: String, default: null },

    // Extra context (e.g. which step was saved, which docType was uploaded)
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    // IP stored as HMAC-SHA256 hash — never raw IP (DPDP Act 2023)
    hashedIp: { type: String },
    userAgent: { type: String, maxlength: 200 },
  },
  {
    timestamps: true,
    collection: "claim_audit_logs",
  }
);

// Audit logs are NEVER deleted — no TTL index
// Archive to claim_audit_logs_archive after 2 years via scheduled job

claimAuditLogSchema.index(
  { claimId: 1, createdAt: -1 },
  { name: "claim_timeline_idx" }
);
claimAuditLogSchema.index(
  { userId: 1, createdAt: -1 },
  { name: "user_actions_idx" }
);
claimAuditLogSchema.index(
  { action: 1, createdAt: -1 },
  { name: "action_type_idx" }
);

export default mongoose.model("ClaimAuditLog", claimAuditLogSchema);
