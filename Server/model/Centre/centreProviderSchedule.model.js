/**
 * centreProviderSchedule.model.js
 *
 * Stores the working-schedule configuration for ONE provider at ONE centre.
 * CENTRE ADMIN WRITES THIS. Providers have READ-ONLY access via API.
 *
 * Key concepts:
 *
 * - validFrom/validUntil: Time period this configuration applies to.
 * - workingDays: 7 entries (Mon-Sun) specifying provider hours.ent. enabled:false = day is off.
 *  - breaks[]: Multiple named break windows (lunch, tea, etc.) — free-input times.
 *    UI shows first break by default, "+ Add Break" adds more.
 *  - appointmentDuration: Free number input (minutes), NOT a fixed enum.
 *  - bufferGap: Free number input (minutes), NOT a fixed enum.
 *  - Slots are NEVER stored — computed on request by centreTimeslot.service.js
 *  - Multiple non-overlapping schedule periods allowed per centre-provider pair.
 *    Overlap is detected at service layer before save.
 */

import mongoose from "mongoose";

// ── Regex constants ───────────────────────────────────────────────────────────
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;
const YMD   = /^\d{4}-\d{2}-\d{2}$/;

// ── Sub-schema: one working day ───────────────────────────────────────────────
const workingDaySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      required: true,
    },
    enabled:   { type: Boolean, default: false },
    // startTime and endTime in HH:mm 24-hour format
    startTime: {
      type: String,
      match: [HH_MM, "startTime must be HH:mm (24h format)"],
      default: "09:00",
    },
    endTime: {
      type: String,
      match: [HH_MM, "endTime must be HH:mm (24h format)"],
      default: "17:00",
    },
  },
  { _id: false }
);

// ── Sub-schema: one break window ──────────────────────────────────────────────
/**
 * A break is a named time block where no appointments are generated.
 * Centre can have multiple breaks per day:
 *   - break[0] = the primary break (shown by default in UI, e.g., "Lunch")
 *   - break[1..n] = add-on breaks (added via "+ Add Break" button in UI)
 *
 * startTime and endTime are free HH:mm inputs entered by centre admin.
 * Validation ensures startTime < endTime and no two breaks overlap.
 */
const breakSchema = new mongoose.Schema(
  {
    // Name shown in UI and in slot array (e.g., "Lunch", "Tea Break", "Prayer Break")
    name: {
      type: String,
      trim: true,
      maxlength: [50, "Break name cannot exceed 50 characters"],
      default: "Break",
    },
    // Free HH:mm input — centre enters any valid time
    startTime: {
      type: String,
      required: [true, "Break startTime is required"],
      match: [HH_MM, "startTime must be HH:mm (24h format)"],
    },
    endTime: {
      type: String,
      required: [true, "Break endTime is required"],
      match: [HH_MM, "endTime must be HH:mm (24h format)"],
    },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────
const centreProviderScheduleSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────────────────────────────
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
      index: true,
    },
    relationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CentreProviderRelation",
      required: true,
    },

    // ── Date-range validity ───────────────────────────────────────────────────
    /**
     * validFrom  (YYYY-MM-DD, inclusive) — first day this schedule is active.
     * validUntil (YYYY-MM-DD, inclusive) — last day. null = permanent.
     *
     * After validUntil, slot generator returns []. Document kept for audit trail.
     * Multiple schedule periods allowed — but date ranges MUST NOT overlap.
     * Overlap is detected by service before save (see centreTimeslot.service.js).
     */
    validFrom: {
      type: String,
      required: [true, "validFrom is required"],
      match: [YMD, "validFrom must be YYYY-MM-DD"],
      index: true,
    },
    validUntil: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (v === null) return true;
          return YMD.test(v) && v >= this.validFrom;
        },
        message: "validUntil must be YYYY-MM-DD and >= validFrom, or null for permanent schedule",
      },
    },

    // ── Exception dates ───────────────────────────────────────────────────────
    /**
     * Specific calendar dates within validFrom–validUntil that are skipped.
     * Provider unavailable on these dates even if it's a normally-enabled day.
     * Use for centre-admin-initiated one-off skips within this schedule period.
     *
     * For centre-wide closures → use CentreLeave collection.
     * For provider-initiated leave → use ProviderLeave collection.
     * Max 100 per schedule. If more are needed, split into a new schedule period.
     */
    exceptionDates: {
      type: [String],
      validate: [
        {
          validator: (arr) => arr.length <= 100,
          message: "exceptionDates cannot exceed 100 entries per schedule period",
        },
        {
          validator: (arr) => arr.every((d) => YMD.test(d)),
          message: "All exceptionDates must be in YYYY-MM-DD format",
        },
        {
          validator: function (arr) {
            const until = this.validUntil || "9999-12-31";
            return arr.every((d) => d >= this.validFrom && d <= until);
          },
          message: "exceptionDates must fall within the schedule's validFrom–validUntil range",
        },
      ],
      default: [],
    },

    // ── Working pattern ───────────────────────────────────────────────────────
    /**
     * Always exactly 7 entries — one per day of the week.
     * enabled:false = provider doesn't work that day.
     * enabled:true  = provider works startTime–endTime on that day.
     * All 7 always stored so UI can show all days without client-side defaulting.
     */
    workingDays: {
      type: [workingDaySchema],
      validate: {
        validator: (days) => days.length === 7,
        message: "workingDays must contain exactly 7 entries (one per day)",
      },
      default: () =>
        ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(
          (day) => ({ day, enabled: false, startTime: "09:00", endTime: "17:00" })
        ),
    },

    // ── Session settings — FREE INPUT (not enum) ──────────────────────────────
    /**
     * appointmentDuration: minutes per appointment.
     * Centre enters any value between 5 and 240 minutes.
     * e.g., 25 min → slots: 09:00–09:25, 09:35–10:00 (with 10-min buffer)
     *
     * NOT stored as enum. Centre admin should be free to enter any duration.
     */
    appointmentDuration: {
      type: Number,
      required: [true, "Appointment duration is required"],
      min: [5,   "Minimum appointment duration is 5 minutes"],
      max: [240, "Maximum appointment duration is 240 minutes (4 hours)"],
      default: 30,
    },

    /**
     * bufferGap: gap between consecutive appointments (minutes).
     * e.g., 10-min buffer after 30-min session = cursor moves 40 min per slot.
     * Centre enters any value between 0 and 60 minutes.
     */
    bufferGap: {
      type: Number,
      min: [0,  "Buffer gap cannot be negative"],
      max: [60, "Maximum buffer gap is 60 minutes"],
      default: 0,
    },

    // ── Break windows — MULTIPLE, NAMED ──────────────────────────────────────
    /**
     * breaks[]: array of named break windows.
     *
     * UI BEHAVIOUR:
     *   - Initially shows ONE break input (the first entry — index 0).
     *   - "+ Add Break" button appends to this array (index 1, 2, …).
     *   - Each break has a name (e.g., "Lunch", "Tea Break"), startTime, endTime.
     *   - All times are free HH:mm inputs.
     *
     * Max 5 breaks per schedule (reasonable ceiling for a working day).
     * Slot generator skips all enabled break windows.
     * Pre-save hook validates no two breaks overlap.
     */
    breaks: {
      type: [breakSchema],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Maximum 5 break windows allowed per schedule",
      },
      default: [],
    },

    // ── Access control ────────────────────────────────────────────────────────
    /**
     * configuredByUser: User._id of the centre admin who last saved this schedule.
     * Only centre admin users can write to this collection (enforced at route level).
     * Providers GET only.
     */
    configuredByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Optional human-readable label to distinguish schedule periods
    label: {
      type: String,
      trim: true,
      maxlength: [80, "Label cannot exceed 80 characters"],
      default: "",
    },

    // ── Optimistic concurrency guard ──────────────────────────────────────────
    /**
     * Client reads `version` with the schedule. On PUT, client sends back
     * the same version. Service checks: if DB version !== submitted version
     * → someone else saved between client's GET and PUT → 409 Conflict.
     * Service increments this on every successful write.
     */
    version: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "centre_provider_schedules",
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

/**
 * PRIMARY: "Find the active schedule for provider P at centre C on date D"
 * Query: { centreId, providerId, validFrom: {$lte:D}, $or:[{validUntil:null},{validUntil:{$gte:D}}] }
 */
centreProviderScheduleSchema.index(
  { centreId: 1, providerId: 1, validFrom: 1, validUntil: 1 },
  { name: "idx_schedule_date_range_lookup" }
);

/**
 * OVERLAP DETECTION: before saving a new schedule period
 * Query: { centreId, providerId, isActive:true, validFrom:{$lte:newUntil}, ... }
 */
centreProviderScheduleSchema.index(
  { centreId: 1, providerId: 1, isActive: 1, validFrom: 1 },
  { name: "idx_schedule_overlap_check" }
);

/**
 * HISTORY: all schedule periods for a provider at a centre, newest first
 */
centreProviderScheduleSchema.index(
  { centreId: 1, providerId: 1, createdAt: -1 },
  { name: "idx_schedule_history" }
);

centreProviderScheduleSchema.index(
  { relationId: 1, validFrom: 1 },
  { name: "idx_schedule_by_relation" }
);

// ── Virtual: scheduleStatus (computed, never stored) ─────────────────────────
centreProviderScheduleSchema.virtual("scheduleStatus").get(function () {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if (!this.isActive) return "cancelled";
  if (today < this.validFrom) return "upcoming";
  if (this.validUntil && today > this.validUntil) return "expired";
  return "active";
});

// ── Instance: isActiveOnDate(dateStr) ─────────────────────────────────────────
/**
 * Single gate — returns true if this schedule should generate slots for dateStr.
 * Checks: isActive, date range, exception dates.
 */
centreProviderScheduleSchema.methods.isActiveOnDate = function (dateStr) {
  if (!this.isActive) return false;
  if (dateStr < this.validFrom) return false;
  if (this.validUntil && dateStr > this.validUntil) return false;
  if (this.exceptionDates.includes(dateStr)) return false;
  return true;
};

// ── Pre-save: business rule validations ───────────────────────────────────────
centreProviderScheduleSchema.pre("save", function (next) {
  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Validate each enabled working day
  for (const day of this.workingDays) {
    if (!day.enabled) continue;

    if (toMin(day.startTime) >= toMin(day.endTime)) {
      return next(
        new Error(`${day.day}: startTime (${day.startTime}) must be before endTime (${day.endTime})`)
      );
    }
  }

  // Validate break windows
  const enabledBreaks = this.breaks.filter((b) => b.enabled);

  for (const b of enabledBreaks) {
    if (toMin(b.startTime) >= toMin(b.endTime)) {
      return next(
        new Error(`Break "${b.name}": startTime (${b.startTime}) must be before endTime (${b.endTime})`)
      );
    }
  }

  // No two breaks should overlap
  for (let i = 0; i < enabledBreaks.length; i++) {
    for (let j = i + 1; j < enabledBreaks.length; j++) {
      const a = enabledBreaks[i];
      const b = enabledBreaks[j];
      const aStart = toMin(a.startTime), aEnd = toMin(a.endTime);
      const bStart = toMin(b.startTime), bEnd = toMin(b.endTime);
      if (aStart < bEnd && bStart < aEnd) {
        return next(
          new Error(`Breaks "${a.name}" (${a.startTime}–${a.endTime}) and "${b.name}" (${b.startTime}–${b.endTime}) overlap`)
        );
      }
    }
  }

  next();
});

export default mongoose.model("CentreProviderSchedule", centreProviderScheduleSchema);
