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
      required: true,
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
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
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
