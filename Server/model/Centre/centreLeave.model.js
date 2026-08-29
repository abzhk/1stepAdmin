/**
 * centreLeave.model.js
 *
 * Centre-wide closure / leave records.
 * When a CentreLeave record covers a date, ALL providers at that centre
 * have their slots blocked for that date — unless explicitly exempted.
 *
 * This blocking is applied in the slot generator (centreTimeslot.service.js)
 * and also in the PARENT-FACING provider profile slot display.
 *
 * No recurring concept — each leave entry is a concrete date range.
 * For one-off provider slots, use CentreProviderTempBlock.
 * For provider-initiated leave, use ProviderLeave.
 */

import mongoose from "mongoose";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

const centreLeaveSchema = new mongoose.Schema(
  {
    // ── Centre reference ──────────────────────────────────────────────────────
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",          // providerType: "centre"
      required: true,
      index: true,
    },

    // ── Date range (both inclusive) ───────────────────────────────────────────
    /**
     * Single-day leave:  dateFrom === dateTo
     * Multi-day closure: dateFrom < dateTo
     *
     * Stored as YYYY-MM-DD strings (timezone-safe, lexicographically sortable).
     */
    dateFrom: {
      type: String,
      required: [true, "dateFrom is required"],
      match: [YMD, "dateFrom must be YYYY-MM-DD"],
      index: true,
    },
    dateTo: {
      type: String,
      required: [true, "dateTo is required"],
      match: [YMD, "dateTo must be YYYY-MM-DD"],
      validate: {
        validator: function (v) {
          return YMD.test(v) && v >= this.dateFrom;
        },
        message: "dateTo must be YYYY-MM-DD and >= dateFrom",
      },
    },

    // ── Metadata ──────────────────────────────────────────────────────────────
    reason: {
      type: String,
      trim: true,
      maxlength: [300, "Reason cannot exceed 300 characters"],
      default: "",
    },
    leaveType: {
      type: String,
      enum: [
        "public_holiday",   // Government / national holiday
        "centre_holiday",   // Centre's own holiday
        "renovation",       // Building / facility work
        "training",         // Staff training day
        "emergency",        // Unplanned emergency closure
        "maintenance",
        "other",
      ],
      default: "centre_holiday",
    },

    // ── Provider exceptions ───────────────────────────────────────────────────
    /**
     * Providers listed here are EXEMPT from this centre leave.
     * Their slots are NOT blocked during this closure period.
     * Useful for providers with their own independent practice rooms.
     */
    exceptions: [
      {
        providerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "provider",
          required: true,
        },
        reason: {
          type: String,
          trim: true,
          maxlength: 200,
          default: "",
        },
      },
    ],

    // ── Audit ─────────────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "centre_leaves",
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

/**
 * PRIMARY: "Is the centre on leave on date D?"
 * Query: { centreId, dateFrom:{$lte:D}, dateTo:{$gte:D}, isActive:true }
 */
centreLeaveSchema.index(
  { centreId: 1, dateFrom: 1, dateTo: 1, isActive: 1 },
  { name: "idx_centre_leave_date_range" }
);

/**
 * CALENDAR VIEW: all leaves for a centre in date order
 */
centreLeaveSchema.index(
  { centreId: 1, dateFrom: 1 },
  { name: "idx_centre_leave_calendar" }
);

// ── Pre-save validation ────────────────────────────────────────────────────────
centreLeaveSchema.pre("save", function (next) {
  // Duplicate exception providers not allowed
  const ids = this.exceptions.map((e) => e.providerId.toString());
  if (new Set(ids).size !== ids.length) {
    return next(new Error("Duplicate providers in exceptions array"));
  }
  next();
});

export default mongoose.model("CentreLeave", centreLeaveSchema);
