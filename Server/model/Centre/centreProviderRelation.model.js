/**
 * centreProviderRelation.model.js
 *
 * Core join table between a Centre (providerType:"centre") and an individual
 * Provider (providerType:"individual").
 *
 * One document = one active membership of a provider at a centre.
 * Created when an invitation is accepted.
 */

import mongoose from "mongoose";

const centreProviderRelationSchema = new mongoose.Schema(
  {
    // ── Parties ───────────────────────────────────────────────────────────────
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",          // providerType: "centre"
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",          // providerType: "individual"
      required: true,
      index: true,
    },

    // ── Financials ────────────────────────────────────────────────────────────
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: [0, "Fee cannot be negative"],
    },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    // ── Audit trail ───────────────────────────────────────────────────────────
    joinedAt:   { type: Date, default: Date.now },
    leftAt:     { type: Date, default: null },
    addedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    removedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // ── Running counters (updated by booking events, never queried for joins) ─
    totalBookings:  { type: Number, default: 0, min: 0 },
    totalCompleted: { type: Number, default: 0, min: 0 },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "centre_provider_relations",
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// One active relation per centre-provider pair
centreProviderRelationSchema.index(
  { centreId: 1, providerId: 1 },
  { unique: true, name: "idx_unique_centre_provider" }
);

// Centre dashboard: list all active providers ordered by join date
centreProviderRelationSchema.index(
  { centreId: 1, isActive: 1, joinedAt: -1 },
  { name: "idx_centre_active_providers" }
);

// Provider dashboard: list all centres the provider belongs to
centreProviderRelationSchema.index(
  { providerId: 1, isActive: 1 },
  { name: "idx_provider_active_centres" }
);

// ── Pre-save: type guard ──────────────────────────────────────────────────────
centreProviderRelationSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  const Provider = mongoose.model("provider");
  const [centre, provider] = await Promise.all([
    Provider.findOne({ _id: this.centreId,   providerType: "centre"     }).select("_id").lean(),
    Provider.findOne({ _id: this.providerId, providerType: "individual" }).select("_id").lean(),
  ]);
  if (!centre)
    return next(new Error("centreId must reference a document with providerType='centre'"));
  if (!provider)
    return next(new Error("providerId must reference a document with providerType='individual'"));
  next();
});

export default mongoose.model("CentreProviderRelation", centreProviderRelationSchema);
