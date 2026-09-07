import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    //removed at 31-12-25 passwordless auth using OTP Login
    password: {
      type: String,
    },
    profilePicture: {
      type: String,
      default: "https://i.ibb.co/tKQH4zp/defaultprofile.jpg",
    },
    unlockedModules: [
      {
        type: String,
        trim: true,
      },
    ],
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
      permissionsOverride: [
  {
    module: String,
    actions: [String],
  },
],
    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },

    refreshToken: String,
    lastLoginAt: Date,
    emailVerifiedAt: Date,
    profileCompletedAt: Date,

    // ── SaaS Account Lifecycle ────────────────────────────────────────────────
    // accountStatus drives all access control. isActive mirrors it for backwards
    // compatibility with existing queries that check isActive.
    //   active      → normal operation
    //   deactivated → admin-initiated soft lock; admin can reactivate from dashboard
    accountStatus: {
      type: String,
      enum: ["active", "deactivated"],
      default: "active",
      index: true,
    },

    // Metadata for the most recent deactivation/reactivation event
    deactivationMeta: {
      reason: { type: String, default: null },
      deactivatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      deactivatedAt: { type: Date, default: null },
      reactivatedAt: { type: Date, default: null },
      reactivatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },

    // Immutable audit trail — up to 50 entries per user
    accountStatusHistory: {
      type: [
        {
          fromStatus: { type: String },
          toStatus:   { type: String },
          changedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reason:     { type: String, default: "" },
          changedAt:  { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

// userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

userSchema.post("save", async function () {
  try {
    const Stats = (await import("./stats.model.js")).default; 
    await Stats.updateOne({}, { $inc: { totalUsers: 1 } }, { upsert: true });
  } catch (err) {
    console.error("Failed to increment ", err);
  }
});
const User = mongoose.model("User", userSchema);

export default User;
