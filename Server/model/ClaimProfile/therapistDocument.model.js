import mongoose from "mongoose";

const therapistDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TherapistClaimRequest",
      required: true,
    },

    // Document classification
    docType: {
      type: String,
      enum: [
        "aadhaar_front",
        "aadhaar_back",
        "pan_card",
        "selfie_liveness",
        "degree_certificate",
        "rci_certificate",
        "clinic_photo",
        "address_proof",
        "cancelled_cheque",
      ],
      required: true,
    },

    // Firebase Storage — path only, NEVER store signed URLs
    storageProvider: {
      type: String,
      enum: ["firebase"],
      default: "firebase",
    },
    fileRef: {
      // "claims/{userId}/{claimId}/{docType}/{timestamp}_{filename}"
      type: String,
      required: true,
    },

    // File metadata
    fileName:      { type: String },
    mimeType: {
      type: String,
      enum: ["image/jpeg", "image/png", "application/pdf"],
    },
    fileSizeBytes: { type: Number },

    // Admin review of this specific document
    docStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    docRejectionReason: { type: String, default: null },

    // Audit
    uploadedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },

    // Soft delete — never hard delete documents
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Per-claim document lookup by type
therapistDocumentSchema.index(
  { userId: 1, claimId: 1, docType: 1 },
  { name: "user_claim_doc_idx" }
);

// Admin pending-document queue
therapistDocumentSchema.index(
  { docStatus: 1, uploadedAt: -1 },
  { name: "admin_doc_review_idx" }
);

// Per-claim status filter
therapistDocumentSchema.index(
  { claimId: 1, docStatus: 1 },
  { name: "claim_doc_status_idx" }
);

export default mongoose.model("TherapistDocument", therapistDocumentSchema);
