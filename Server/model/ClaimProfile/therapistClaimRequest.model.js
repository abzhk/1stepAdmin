import mongoose from "mongoose";

const therapistClaimRequestSchema = new mongoose.Schema(
  {
    // === Identity Links ===
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      default: null,
    },

    // === State Machine ===
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "approved", "rejected", "fix_requested"],
      default: "draft",
      index: true,
    },
    version: {
      type: Number,
      default: 1, // increments on each resubmit
    },

    // === Timestamps ===
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },

    // === Admin Review ===
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    rejectionCategory: {
      type: String,
      enum: [
        "invalid_document",
        "blurry_image",
        "registration_mismatch",
        "incomplete_profile",
        "duplicate_account",
        "other",
      ],
      default: null,
    },
    adminNotes: {
      type: String,
      default: null, // internal only — never shown to therapist
    },

    // === Profile Lock ===
    isLocked: {
      type: Boolean,
      default: false, // true after submission — prevent edits
    },

    // === Completion Flags (denormalised for quick UI gating) ===
    completionFlags: {
      emailVerified: { type: Boolean, default: false },
      identityVerified: { type: Boolean, default: false },
      qualifyComplete: { type: Boolean, default: false },
      practiceComplete: { type: Boolean, default: false },
      paymentComplete: { type: Boolean, default: false },
      documentsUpload: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// One active claim per user
therapistClaimRequestSchema.index(
  { userId: 1, status: 1 },
  { name: "user_claim_status_idx" }
);

// Admin review queue — sorted by submission time
therapistClaimRequestSchema.index(
  { status: 1, submittedAt: -1 },
  { name: "admin_queue_idx" }
);

export default mongoose.model("TherapistClaimRequest", therapistClaimRequestSchema);
