/**
 * centreProviderTempBlock.model.js
 *
 * Centre-admin-created temporary block for a specific provider at the centre.
 * Covers a partial or full time window on a single calendar date.
 *
 * Examples:
 *   - "Centre Meeting" blocks Dr. John 14:00–16:00 on Aug 10
 *   - "Emergency facility closure" blocks all slots 09:00–18:00 on Aug 15
 *
 * Use CentreLeave for multi-day centre-wide closures.
 * Use ProviderLeave for provider-initiated leave.
 *
 * Auto-deleted by TTL 1 day after the block date.
 */

import mongoose from "mongoose";

const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;
const YMD   = /^\d{4}-\d{2}-\d{2}$/;

const centreProviderTempBlockSchema = new mongoose.Schema(
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

    // ── Block date and time window ────────────────────────────────────────────
    /**
     * date: YYYY-MM-DD (single day only — for multi-day use CentreLeave)
     * startTime / endTime: HH:mm 24-hour format
     *
     * To block an entire working day, set startTime=centreOpenTime, endTime=centreCloseTime.
     */
    date: {
      type: String,
      required: [true, "Block date is required"],
      match: [YMD, "date must be YYYY-MM-DD"],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, "startTime is required"],
      match: [HH_MM, "startTime must be HH:mm (24h format)"],
    },
    endTime: {
      type: String,
      required: [true, "endTime is required"],
      match: [HH_MM, "endTime must be HH:mm (24h format)"],
    },

    // ── Metadata ──────────────────────────────────────────────────────────────
    reason: {
      type: String,
      trim: true,
      maxlength: [200, "Reason cannot exceed 200 characters"],
      default: "",
    },
    blockType: {
      type: String,
      enum: ["centre_meeting", "internal_event", "maintenance", "emergency", "other"],
      default: "other",
    },

    // ── Created by (centre admin) ─────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── TTL — auto-delete 1 day after block date ──────────────────────────────
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "centre_provider_temp_blocks",
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

/** TTL auto-cleanup */
centreProviderTempBlockSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "idx_temp_block_ttl" }
);

/**
 * PRIMARY: daily timeline — all blocks for a specific provider at a centre on a date
 */
centreProviderTempBlockSchema.index(
  { centreId: 1, providerId: 1, date: 1 },
  { name: "idx_temp_block_cpd" }
);

/**
 * CENTRE-WIDE: all blocks across all providers at a centre on a date
 */
centreProviderTempBlockSchema.index(
  { centreId: 1, date: 1 },
  { name: "idx_temp_block_centre_date" }
);

// ── Pre-save validations ──────────────────────────────────────────────────────
centreProviderTempBlockSchema.pre("validate", function (next) {
  if (!this.isNew) return next();

  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

  // startTime must be before endTime
  if (toMin(this.startTime) >= toMin(this.endTime)) {
    return next(new Error("Block startTime must be before endTime"));
  }

  // Cannot block a past date
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if (this.date < todayStr) {
    return next(new Error("Cannot create a temporary block for a past date"));
  }

  // Auto-set expiresAt = midnight 1 day after block date
  if (!this.expiresAt) {
    const [y, mo, d] = this.date.split("-").map(Number);
    this.expiresAt = new Date(y, mo - 1, d + 1);
  }

  next();
});

export default mongoose.model("CentreProviderTempBlock", centreProviderTempBlockSchema);
