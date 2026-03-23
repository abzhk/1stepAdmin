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
    // createdAt is provided by timestamps: true
    completedAt: {
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
  },
  { timestamps: true }
);

bookingSchema.index({ patient: 1, status: 1, createdAt: -1 });

bookingSchema.index({
  provider: 1,
  "scheduledTime.date": 1,
  status: 1,
});

bookingSchema.index({ sessionType: 1, "scheduledTime.date": 1 });

const bookedSlotSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "provider",
    required: true,
  },
  bookedSlots: {
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

bookedSlotSchema.index(
  { "bookedSlots.expireAt": 1 },
  { expireAfterSeconds: 0 }
);

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
