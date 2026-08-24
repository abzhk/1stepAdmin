import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    // null = booked via provider's own individual practice
    // ObjectId = booked via this specific centre
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      default: null,
    },
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    scheduledTime: {
      slot: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
        index: true,
      },
    },
    note: {
      type: String,
      required: true,
    },
    service: {
      type: Array,
      required: true,
    },
    sessionType: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "expired", "cancelled", "rescheduled"],
      default: "pending",
    },
    cancelledBy: {
      type: String,
      enum: ["patient", "provider", "admin", "centre"],
      default: null,
    },
    comments: {
      type: String,
      default: null,
      maxlength: 500,
      trim: true,
    },
    statusUpdatedAt: {
      type: Date,
      default: null,
    },
    sessionLink: {
      url: { type: String, default: null },
      platform: { type: String, default: null },
      sharedAt: { type: Date, default: null },
      sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "provider" },
    },
    providerSnapshot: {
      fullName: String,
      profilePicture: String,
      therapytype: Array,
    },
    patientSnapshot: {
      patientName: String,
      profilePicture: String,
      username: String,
    },
    // Fee paid — snapshot at booking time so historical records are unaffected
    // by future consultationFee or regularPrice changes
    bookedPrice: {
      type: Number,
      default: null,
    },

    /**
     * Structured appointment timing — NEW field alongside legacy scheduledTime.
     *
     * dateStr      : YYYY-MM-DD in IST — timezone-safe, for display/date grouping
     * startTime    : "HH:mm" in IST   — for UI display ("9:30 AM")
     * durationMinutes: snapshot at booking time so frontend can compute endTime
     * startAt      : full UTC Date    — for DB sort & ascending list queries
     * endAt        : full UTC Date    — for cron "has session ended?" comparisons
     *
     * Old scheduledTime is kept untouched; new code should use `appointment`.
     */
    appointment: {
      dateStr:         { type: String, index: true },  // "2026-08-11"
      startTime:       { type: String },               // "09:30"
      durationMinutes: { type: Number },               // 30
      startAt:         { type: Date,   index: true },  // UTC
      endAt:           { type: Date,   index: true },  // UTC
    },
  },
  { timestamps: true }
);

bookingSchema.index({ patient: 1, status: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, "scheduledTime.date": 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ sessionType: 1, "scheduledTime.date": 1 });
// Centre-scoped dashboard queries: get all bookings for a provider under a specific centre
bookingSchema.index({ centreId: 1, provider: 1, "scheduledTime.date": 1 });
bookingSchema.index({ centreId: 1, status: 1, createdAt: -1 });

// ── NEW: appointment-time-based indexes ──────────────────────────────────────
// Sort provider list by appointment time ascending (soonest appointment first)
bookingSchema.index({ provider: 1, "appointment.startAt": 1, status: 1 });
// Sort parent list by appointment time ascending
bookingSchema.index({ patient: 1, "appointment.startAt": 1, status: 1 });
// Cron: find approved/pending bookings whose appointment has ended
bookingSchema.index({ status: 1, "appointment.endAt": 1 });

const bookedSlotSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "provider",
    required: true,
  },
  // null = individual practice slot. ObjectId = centre-specific slot.
  centreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "provider",
    default: null,
  },
  bookedSlots: {
    // Always stored as YYYY-MM-DD string via normalizeSlotDate(). Never a raw locale string.
    date: {
      type: String,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      required: true,
    },
  },
});

// Auto-expire the slot document after the booking date passes.
bookedSlotSchema.index(
  { "bookedSlots.expireAt": 1 },
  { expireAfterSeconds: 0 }
);
// Fast duplicate-check: is this provider's slot on this date already taken?
// Used in booking creation and reschedule conflict check.
bookedSlotSchema.index(
  { provider: 1, "bookedSlots.date": 1, "bookedSlots.slot": 1 },
  { name: "unique_provider_date_slot", unique: true }
);
bookingSchema.index({
    provider: 1,
    createdAt: -1
});

bookingSchema.post("save", async function () {
  try {

    const Stats = (await import("../models/Admin/stats.model.js")).default;

    await Stats.updateOne({}, { $inc: { totalBookings: 1 } });

  } catch (err) {

    console.error("Failed to increment Stats.totalBookings:", err);
  }
});

const BookedSlots = mongoose.model("BookedSlots", bookedSlotSchema);

const Booking = mongoose.model("Booking", bookingSchema);

export { Booking, BookedSlots };
