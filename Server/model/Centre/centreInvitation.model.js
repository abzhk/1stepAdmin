/**
 * centreInvitation.model.js
 *
 * Manages the full lifecycle of a centre inviting a provider to join.
 *
 * Flow:
 *   1. Centre admin sends invite → creates this document, emails raw token
 *   2. Provider receives email with tokenised link
 *   3. Provider clicks link → API verifies SHA-256 hash of token
 *   4. Provider accepts → CentreProviderRelation created, status="accepted"
 *   5. Provider rejects → status="rejected"
 *   6. Token expires (TTL) → status remains "pending" but token invalid
 *
 * Security:
 *   - Raw token lives ONLY in the email link (never stored in DB)
 *   - tokenHash (SHA-256) stored in DB — compared on verify
 *   - select:false on tokenHash — excluded from all queries by default
 */

import mongoose from "mongoose";
import crypto   from "crypto";

const centreInvitationSchema = new mongoose.Schema(
  {
    // ── Parties ───────────────────────────────────────────────────────────────
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: [true, "centreId is required"],
      index: true,
    },
    /**
     * Populated after the invitation is accepted.
     * Set to the Provider._id that accepted.
     */
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      default: null,
    },

    // ── Invited provider identity ─────────────────────────────────────────────
    invitedEmail: {
      type: String,
      required: [true, "invitedEmail is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    invitedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name:   { type: String, default: "" },
    },

    // ── Offer details ─────────────────────────────────────────────────────────
    consultationFee: {
      type: Number,
      required: [true, "consultationFee is required"],
      min: [0, "Fee cannot be negative"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
      default: "",
    },

    // ── Secure token ──────────────────────────────────────────────────────────
    /**
     * token:     UUID-style hex string placed in the email link.
     *            Stored here for uniqueness enforcement.
     * tokenHash: SHA-256 of the raw token. Used for verification.
     *            select:false — never returned by queries.
     */
    token:     { type: String, required: true, unique: true },
    tokenHash: { type: String, required: true, select: false },

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    /**
     * expiresAt: when this invitation expires.
     * Invitation links are valid for 7 days by default.
     * TTL index auto-deletes the document after expiry.
     * After expiry, verify endpoint returns 410 Gone.
     */
    expiresAt: { type: Date, required: true },

    /**
     * statusUpdatedAt: the moment status last changed from "pending".
     * Read together with the status enum to know what happened and when:
     *
     *   status: "accepted"  + statusUpdatedAt → accepted at this time
     *   status: "rejected"  + statusUpdatedAt → rejected at this time
     *   status: "cancelled" + statusUpdatedAt → cancelled at this time
     *   status: "pending"   + statusUpdatedAt: null → not yet acted on
     *
     * Replaces three redundant fields (acceptedAt / rejectedAt / cancelledAt)
     * that were mutually exclusive — only one could ever be set at a time.
     */
    statusUpdatedAt: { type: Date, default: null },

    // ── Resend tracking ───────────────────────────────────────────────────────
    resentCount:  { type: Number, default: 0, min: 0 },
    lastResentAt: { type: Date, default: null },

    // ── Delivery tracking ─────────────────────────────────────────────────────
    emailDelivered:   { type: Boolean, default: false },
    notificationSent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "centre_invitations",
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

/**
 * Enforce: only ONE pending invitation per centre-email pair.
 * Partial index: unique only applies when status = "pending".
 * After rejection/cancellation, a new invitation can be sent.
 */
centreInvitationSchema.index(
  { centreId: 1, invitedEmail: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
    name: "idx_unique_pending_invitation",
  }
);

/** Centre invitation dashboard */
centreInvitationSchema.index(
  { centreId: 1, status: 1, createdAt: -1 },
  { name: "idx_centre_invitations_by_status" }
);

/** Provider inbox: "Which centres have invited me?" */
centreInvitationSchema.index(
  { invitedEmail: 1, status: 1, createdAt: -1 },
  { name: "idx_invitations_by_email" }
);

/** TTL auto-cleanup after expiry */
centreInvitationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "idx_invitation_ttl" }
);

// ── Static: generate a cryptographically secure token pair ───────────────────
/**
 * Returns { raw, hash }
 * raw  → placed in email link query param
 * hash → stored in DB as tokenHash
 */
centreInvitationSchema.statics.generateTokenPair = function () {
  const raw  = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
};

/**
 * Static: verify a raw token against a stored invitation.
 * Returns the invitation if valid, null otherwise.
 */
centreInvitationSchema.statics.verifyToken = async function (rawToken) {
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const invitation = await this.findOne({ token: rawToken })
    .select("+tokenHash")
    .lean();
  if (!invitation) return null;
  if (invitation.tokenHash !== hash) return null;
  if (invitation.status !== "pending") return null;
  if (new Date() > invitation.expiresAt) return null;
  return invitation;
};

// ── Instance: isValid ─────────────────────────────────────────────────────────
centreInvitationSchema.methods.isValid = function () {
  return this.status === "pending" && new Date() < this.expiresAt;
};

export default mongoose.model("CentreInvitation", centreInvitationSchema);
