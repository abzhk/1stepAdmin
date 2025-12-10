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
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "https://i.ibb.co/tKQH4zp/defaultprofile.jpg",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
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
