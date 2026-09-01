/**
 * providerLeave.model.js
 *
 * Provider-managed leave records.
 * Providers control their own unavailability — separate from centre-managed blocks.
 *
 * SCOPE determines WHERE the leave applies:
 *   "global"           → Provider unavailable EVERYWHERE (all centres + individual practice)
 *   "individual_only"  → Only individual practice is blocked. Centre slots unaffected.
 *   "centre_specific"  → Only blocked at the specified centreId.
 *
 * SUPPORTS:
 *   Full-day leave:        dateFrom = dateTo, startTime/endTime both null
 *   Multi-day leave:       dateFrom < dateTo, startTime/endTime both null
 *   Partial-day (sudden):  dateFrom = dateTo, startTime + endTime set
 *                          e.g. "Today 14:00–16:00 I'm unavailable at Centre A"
 *
 * EFFECT ON SLOTS:
 *   Full-day    → Slot generator returns [] for that date/scope
 *   Partial-day → Affected time windows marked type:"blocked", source:"provider"
 *
 * Auto-cleaned by TTL index 1 day after dateTo.
 */

import mongoose from "mongoose";

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;
const YMD   = /^\d{4}-\d{2}-\d{2}$/;

const providerLeaveSchema = new mongoose.Schema(
  {
    // ── Provider reference ────────────────────────────────────────────────────
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
      index: true,
    },

    // ── Scope ─────────────────────────────────────────────────────────────────
    scope: {
      type: String,
      enum: ["global", "individual_only", "centre_specific"],
      required: [true, "Scope is required"],
      index: true,
    },

    /**
     * Required only when scope === "centre_specific".
     * Must be a centre the provider is actively joined to.
     * Null for global and individual_only scopes.
     */
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      default: null,
      index: true,
    },

    // ── Date range (both YYYY-MM-DD, both inclusive) ──────────────────────────
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

    // ── Partial-day time window ───────────────────────────────────────────────
    /**
     * Both null → full-day leave.
     * Both set  → partial-day leave (sudden break).
     *
     * CONSTRAINT: startTime/endTime only valid for single-day leave (dateFrom === dateTo).
     * Multi-day partial leave is semantically undefined — use full-day instead.
     */
    startTime: {
      type: String,
      default: null,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "startTime must be HH:mm (24h) or null"],
    },
    endTime: {
      type: String,
      default: null,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "endTime must be HH:mm (24h) or null"],
    },

    // ── Metadata ──────────────────────────────────────────────────────────────
    leaveType: {
      type: String,
      enum: [
        "personal",       // General personal leave
        "sick",           // Illness
        "emergency",      // Unplanned emergency
        "sudden_break",   // Mid-day unscheduled break
        "training",       // Workshop / conference
        "other",
      ],
      default: "personal",
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [300, "Reason cannot exceed 300 characters"],
      default: "",
    },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
      index: true,
    },
    cancelledAt: { type: Date, default: null },

    // ── TTL — auto-delete 1 day after dateTo ──────────────────────────────────
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "provider_leaves",
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

/**
 * PRIMARY: "Is provider P on leave (any scope) on date D?"
 * Query: { providerId, status:"active", dateFrom:{$lte:D}, dateTo:{$gte:D} }
 */
providerLeaveSchema.index(
  { providerId: 1, status: 1, dateFrom: 1, dateTo: 1 },
  { name: "idx_provider_leave_date_range" }
);

/**
 * CENTRE-SPECIFIC: "Is provider P on leave at centre C on date D?"
 * Query: { providerId, centreId, scope:"centre_specific", status:"active", dateFrom, dateTo }
 */
providerLeaveSchema.index(
  { providerId: 1, centreId: 1, scope: 1, status: 1, dateFrom: 1 },
  { name: "idx_provider_centre_leave" }
);

/**
 * SCOPE FILTER: "All global leaves for provider P covering date D"
 */
providerLeaveSchema.index(
  { providerId: 1, scope: 1, status: 1, dateFrom: 1 },
  { name: "idx_provider_leave_by_scope" }
);

/** TTL auto-cleanup */
providerLeaveSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "idx_provider_leave_ttl" }
);

// ── Pre-save validations ──────────────────────────────────────────────────────
providerLeaveSchema.pre("validate", function (next) {
  // Rule 1: centre_specific requires centreId
  if (this.scope === "centre_specific" && !this.centreId) {
    return next(new Error("centreId is required when scope is 'centre_specific'"));
  }

  // Rule 2: global / individual_only must NOT have centreId
  if (this.scope !== "centre_specific" && this.centreId) {
    return next(new Error("centreId must be null when scope is 'global' or 'individual_only'"));
  }

  // Rule 3: startTime and endTime must come as a pair (both or neither)
  const hasStart = this.startTime !== null && this.startTime !== "";
  const hasEnd   = this.endTime   !== null && this.endTime   !== "";

  if (hasStart !== hasEnd) {
    return next(new Error("startTime and endTime must both be set or both be null"));
  }

  if (hasStart && hasEnd) {
    // Rule 4: Partial-day only makes sense for a single day
    if (this.dateFrom !== this.dateTo) {
      return next(
        new Error("startTime/endTime can only be used for single-day leave (dateFrom must equal dateTo)")
      );
    }

    // Rule 5: startTime must be before endTime
    const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    if (toMin(this.startTime) >= toMin(this.endTime)) {
      return next(new Error("Leave startTime must be before endTime"));
    }
  }

  // Rule 6: Auto-set expiresAt = midnight 1 day after dateTo
  if (!this.expiresAt) {
    const [y, mo, d] = this.dateTo.split("-").map(Number);
    this.expiresAt = new Date(y, mo - 1, d + 1); // local midnight next day
  }

  next();
});

export default mongoose.model("ProviderLeave", providerLeaveSchema);
