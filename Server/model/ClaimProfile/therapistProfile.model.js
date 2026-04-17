import mongoose from "mongoose";

const therapistProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one draft profile per user
      index: true,
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TherapistClaimRequest",
      required: true,
    },

    // === Step 1: Email ===
    email: {
      address: { type: String, trim: true, lowercase: true },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
    },

    // === Step 3: Qualifications ===
    qualifications: [
      {
      degree: {
        type: String,
        enum: ["BASLP", "MASLP", "BPT", "MPT", "BSLT", "MSLT", "Others"],
      },
      university: { type: String },
      yearOfCompletion: { type: Number },
      registrationBody: {
        type: String,
        enum: ["RCI", "IAP", "ISOPI", "NMC", "Others"],
      },
      // Store encrypted + masked only — never plaintext full number
      registrationNumber: {
        encrypted: { type: String },          // AES-256-GCM encrypted
        masked: { type: String },          // e.g. "RCI/*****/2019" — display only
      },
      registrationVerified: { type: Boolean, default: false },
      registrationVerifiedAt: { type: Date, default: null },
      }
    ],

    // === Step 4: Practice ===
    practice: [
      {
        clinicName: { type: String },
      role: {
        type: String,
        enum: ["Owner", "Employee", "Consultant"],
      },
      address: {
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String, match: /^[1-9][0-9]{5}$/ },
        country: { type: String, default: "India" },
        coordinates: {
          lat: { type: Number },
          lng: { type: Number },
        },
      },
      consultationType: {
        type: String,
        enum: ["In-clinic", "Online", "Both"],
      },
        specializations: { type: [String], default: [] },
        experienceYears: { type: Number },
      }
    ],

    // Computed server-side only — never accepted from client
    profileCompletionScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Snapshot version — matches TherapistClaimRequest.version on each resubmit
    snapshotVersion: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("TherapistProfile", therapistProfileSchema);
