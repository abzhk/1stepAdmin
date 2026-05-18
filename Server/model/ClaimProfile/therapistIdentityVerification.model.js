import mongoose from "mongoose";

const identityVerificationSchema = new mongoose.Schema(
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
      index: true,
    },

    // === Aadhaar ===
    // NEVER store the full 12-digit number — violates UIDAI Circular 2018 + IT Act
    aadhaar: {
      maskedNumber: {
        type: String,
        match: /^XXXX-XXXX-\d{4}$/,  // e.g. "XXXX-XXXX-1234"
      },
      verified:           { type: Boolean, default: false },
      verifiedAt:         { type: Date, default: null },
      verificationTxnId:  { type: String, default: null }, // from DigiLocker / AUA API
      verificationSource: {
        type: String,
        enum: ["digilocker", "uidai_otp", "manual_admin"],
        default: "manual_admin",
      },
    },

    // === PAN ===
    // Store only masked per CBDT rules — e.g. "ABCPX####X"
    pan: {
      maskedNumber:      { type: String, default: null },
      verified:          { type: Boolean, default: false },
      verifiedAt:        { type: Date, default: null },
      verificationTxnId: { type: String, default: null }, // from NSDL/UTI API
    },

    // === Phone OTP ===
    phone: {
      number:     { type: String, match: /^\+91[6-9]\d{9}$/ },
      verified:   { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
    },

    // === Liveness Selfie ===
    selfie: {
      verified:    { type: Boolean, default: false },
      verifiedAt:  { type: Date, default: null },
      documentRef: { type: String, default: null }, // Firebase Storage path only
    },

    // Computed server-side only — never accepted from client
    // Formula: phone=25, selfie=25, aadhaar=30, pan=20
    identityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Soft delete
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model(
  "TherapistIdentityVerification",
  identityVerificationSchema
);
