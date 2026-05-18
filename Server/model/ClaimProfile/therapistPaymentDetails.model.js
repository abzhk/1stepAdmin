import mongoose from "mongoose";

// Consent sub-schema — each checkbox action is logged individually
const consentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    agreedAt: { type: Date, required: true },
    hashedIp: { type: String },  // HMAC-SHA256 hashed — never raw IP (DPDP Act 2023)
    userAgent: { type: String, maxlength: 200 },
  },
  { _id: false }
);

const paymentDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TherapistClaimRequest",
      required: true,
    },

    accountHolderName: { type: String, trim: true },

    // NEVER store raw account number in plaintext
    // Encrypted at application layer before saving
    accountNumberEncrypted: {
      ciphertext: { type: String },  // AES-256-GCM ciphertext
      iv: { type: String },  // initialisation vector
      authTag: { type: String },  // GCM authentication tag
      keyVersion: { type: String, default: "v1" }, // track key rotation
    },

    // Last 4 digits only — safe for display
    accountNumberLast4: {
      type: String,
      match: /^\d{4}$/,
    },

    // IFSC — safe to store plaintext; validate via RBI IFSC API before saving
    ifscCode: {
      type: String,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
      uppercase: true,
    },
    bankName: { type: String },
    branchName: { type: String },

    // Penny-drop verification result (Cashfree / RazorpayX)
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    pennyDropTxnId: { type: String, default: null },

    // Consent records — all checkboxes must be explicitly checked by the user
    consents: { type: [consentSchema], default: [] },

    // Soft delete
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("TherapistPaymentDetail", paymentDetailsSchema);
