import mongoose from "mongoose";

// ─── Notification Types ────────────────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  // Claim Profile events
  CLAIM_SUBMITTED:    "claim_submitted",       // admin receives
  CLAIM_UNDER_REVIEW: "claim_under_review",    // therapist receives
  CLAIM_APPROVED:     "claim_approved",        // therapist receives
  CLAIM_REJECTED:     "claim_rejected",        // therapist receives

  // Booking events
  BOOKING_NEW:           "booking_new",           // provider receives
  BOOKING_APPROVED:      "booking_approved",      // patient receives
  BOOKING_REJECTED:      "booking_rejected",      // patient receives
  BOOKING_CANCELLED:     "booking_cancelled",     // both receive
  BOOKING_RESCHEDULED:   "booking_rescheduled",   // both receive
  SESSION_LINK_SHARED:   "session_link_shared",   // patient receives
  SESSION_COMPLETED:     "session_completed",     // both receive
};

// ─── Schema ────────────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: 120,
    },

    body: {
      type: String,
      required: true,
      maxlength: 500,
    },

    // Contextual payload — bookingId, claimId, redirectPath etc.
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // TTL — auto-delete after 90 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

// ─── Compound indexes for fast inbox queries ───────────────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
