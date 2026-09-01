import mongoose from "mongoose";

const HELP_CATEGORIES = [
  "Account & Access",
  "Payment & Billing",
  "Booking & Scheduling",
  "Technical Support",
  "Report a Bug",
  "General Inquiry",
];

const helpSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: HELP_CATEGORIES,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In progress", "Resolved"],
      default: "Open",
    },
    messages: [
  {
    sender: {
      type: String,
      enum: ["Admin", "User"],
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
],
    attachment: {
      fileName: String,
      url: String,
    },
  },
  { timestamps: true }
);

helpSchema.index({ createdAt: -1 });
helpSchema.pre("save", async function (next) {
  if (this.ticketId) return next();
  const count = await mongoose.model("Help").countDocuments();
  this.ticketId = `#TKT-${2042 + count}`;
  next();
});

const Help = mongoose.model("Help", helpSchema);

export default Help;