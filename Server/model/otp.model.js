import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpType: {
      type: String,
      enum: ["login", "claim_verification", "provider_verification", "reset_password"],
      default: "login",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    roleType: {
      type: String,
      enum: ["Parent", "Provider", "Centre", "Admin"],
      required: false, // Optional for claim verification
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // TTL: Document auto-deletes after 600 seconds (10 minutes)
    },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, otpType: 1 }, { unique: true });

export default mongoose.model("OTP", otpSchema);
