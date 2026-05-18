import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    invitedBy: {
      userId: { type: String, required: true },
      name: String,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    consultationFee: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired", "cancelled"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["provider"],
      default: "provider",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: { type: Date },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
    },
    message: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

invitationSchema.index({ centreId: 1, status: 1 });
invitationSchema.index({ invitedEmail: 1, status: 1 });
invitationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

invitationSchema.index(
  { centreId: 1, invitedEmail: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

const Invitation = mongoose.model("Invitation", invitationSchema);

export default Invitation;
