/**
 * centreBookingRestriction.model.js
 *
 * Per-centre booking rule configuration.
 * One document per centre — created once, updated via PUT (upsert).
 *
 * Controls: advance booking window, cancellation/rescheduling policy,
 * max bookings per patient, allowed session types, and auto-approve.
 */

import mongoose from "mongoose";

const centreBookingRestrictionSchema = new mongoose.Schema(
  {
    // ── Centre reference ──────────────────────────────────────────────────────
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: [true, "centreId is required"],
      unique: true,         // one config document per centre
      index: true,
    },

    // ── Booking window ────────────────────────────────────────────────────────
    /**
     * maxAdvanceBookingDays: How many days ahead a patient can book.
     * e.g., 60 → can only book slots within the next 60 days.
     */
    maxAdvanceBookingDays: {
      type: Number,
      min: [1,   "Must allow at least 1 day advance booking"],
      max: [365, "Cannot allow more than 365 days advance booking"],
      default: 60,
    },

    /**
     * minNoticeHours: Minimum hours before appointment that a booking can be made.
     * e.g., 2 → cannot book a slot that starts within 2 hours from now.
     */
    minNoticeHours: {
      type: Number,
      min: [0,   "Cannot be negative"],
      max: [168, "Maximum 7 days (168 hours) notice required"],
      default: 2,
    },

    // ── Cancellation policy ───────────────────────────────────────────────────
    cancellationAllowed: { type: Boolean, default: true },
    /**
     * cancellationNoticeHours: Patient must cancel at least this many hours
     * before the appointment. 0 = can cancel at any time.
     */
    cancellationNoticeHours: {
      type: Number,
      min: 0,
      default: 24,
    },

    // ── Rescheduling policy ───────────────────────────────────────────────────
    reschedulingAllowed: { type: Boolean, default: true },
    reschedulingNoticeHours: {
      type: Number,
      min: 0,
      default: 24,
    },

    // ── Per-patient limit ─────────────────────────────────────────────────────
    /**
     * Maximum appointments a single patient can book per day at this centre.
     * Prevents a patient from monopolising slots.
     */
    maxBookingsPerPatientPerDay: {
      type: Number,
      min: [1,  "At least 1 booking must be allowed per patient per day"],
      max: [10, "Maximum 10 bookings per patient per day"],
      default: 1,
    },

    // ── Session types ─────────────────────────────────────────────────────────
    allowedSessionTypes: {
      type: [String],
      enum: {
        values: ["in-person", "video", "home-visit", "phone"],
        message: "Invalid session type",
      },
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "At least one session type must be allowed",
      },
      default: ["in-person", "video"],
    },

    // ── Auto-approve ──────────────────────────────────────────────────────────
    /**
     * autoApprove: true → new bookings skip "pending" and go directly to "approved".
     * Suitable for centres with high volume and no manual review step.
     */
    autoApprove: { type: Boolean, default: false },

    // ── Audit ─────────────────────────────────────────────────────────────────
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "centre_booking_restrictions",
  }
);

export default mongoose.model("CentreBookingRestriction", centreBookingRestrictionSchema);
