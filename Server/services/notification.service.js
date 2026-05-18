/**
 * NotificationService — Central notification dispatcher
 *
 * Usage:
 *   import NotificationService from "../services/notification.service.js";
 *   await NotificationService.send({ io, recipientId, type, title, body, data });
 *
 * Every call:
 *  1. Persists a Notification document to MongoDB
 *  2. Emits `notification:new` over Socket.IO to the recipient's private room
 *
 * Domain helpers:
 *  - sendBookingNotification(io, { booking, type, providerUserRef, extraData })
 *  - sendClaimNotification(io, { claimRequest, status, recipientId, rejectionReason })
 */

import Notification, { NOTIFICATION_TYPES } from "../model/notification.model.js";
import User from "../model/user.model.js";

// ─── Copy-friendly human-readable label map ──────────────────────────────────
const TITLE_MAP = {
  [NOTIFICATION_TYPES.CLAIM_SUBMITTED]: "New Claim Submitted",
  [NOTIFICATION_TYPES.CLAIM_UNDER_REVIEW]: "Claim Under Review",
  [NOTIFICATION_TYPES.CLAIM_APPROVED]: "Claim Approved 🎉",
  [NOTIFICATION_TYPES.CLAIM_REJECTED]: "Claim Rejected",
  [NOTIFICATION_TYPES.BOOKING_NEW]: "New Booking Request",
  [NOTIFICATION_TYPES.BOOKING_APPROVED]: "Booking Confirmed ✅",
  [NOTIFICATION_TYPES.BOOKING_REJECTED]: "Booking Declined",
  [NOTIFICATION_TYPES.BOOKING_CANCELLED]: "Booking Cancelled",
  [NOTIFICATION_TYPES.BOOKING_RESCHEDULED]: "Booking Rescheduled 🔄",
  [NOTIFICATION_TYPES.SESSION_LINK_SHARED]: "Session Link Ready 🔗",
  [NOTIFICATION_TYPES.SESSION_COMPLETED]: "Session Completed",
};

class NotificationService {
  /**
   * Core send method.
   * @param {object} opts
   * @param {object|null} opts.io          — Socket.IO server instance (can be null)
   * @param {string}      opts.recipientId — Target User._id (string)
   * @param {string}      opts.type        — One of NOTIFICATION_TYPES values
   * @param {string}      [opts.title]     — Override auto title
   * @param {string}      opts.body        — Notification message body
   * @param {object}      [opts.data]      — Arbitrary payload (bookingId, claimId, etc.)
   * @returns {Promise<import("../models/notification.model.js").default>}
   */
  static async send({ io, recipientId, type, title, body, data = {} }) {
    try {
      const resolvedTitle = title || TITLE_MAP[type] || "Notification";

      // 1. Persist to DB
      const notification = await Notification.create({
        recipient: recipientId,
        type,
        title: resolvedTitle,
        body,
        data,
      });

      // 2. Real-time delivery via Socket.IO
      if (io) {
        io.to(`notif_${recipientId}`).emit("notification:new", {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          isRead: false,
          createdAt: notification.createdAt,
        });
      }

      return notification;
    } catch (err) {
      // Log but never throw — notifications must not block business logic
      console.error("[NotificationService] Failed to send notification:", err.message);
      return null;
    }
  }

  /**
   * Send to multiple recipients at once.
   * @param {object[]} recipients — Array of { recipientId, body? } or just string[] of IDs
   * @param {object}   base       — Common opts (io, type, title, data)
   */
  static async sendBulk({ io, recipientIds, type, title, body, data = {} }) {
    const promises = recipientIds.map((id) =>
      NotificationService.send({ io, recipientId: id, type, title, body, data })
    );
    return Promise.allSettled(promises);
  }

  // ─── Domain helper: Booking ──────────────────────────────────────────────────

  /**
   * @param {object} io
   * @param {object} opts
   * @param {object} opts.booking            — Mongoose booking document (lean or not)
   * @param {string} opts.type               — NOTIFICATION_TYPES.BOOKING_*
   * @param {string} [opts.providerUserId]   — Provider's User._id (for their socket room)
   * @param {object} [opts.extraData]        — Extra payload merged into data
   */
  static async sendBookingNotification(io, { booking, type, providerUserId, extraData = {} }) {
    const patientId = booking.patient?.toString();
    const bookingRef = booking._id?.toString();
    const bookingId = booking.bookingId;

    const sharedData = {
      bookingId: bookingRef,
      bookingRef: bookingId,
      scheduledTime: booking.scheduledTime,
      ...extraData,
    };

    const providerName = booking.providerSnapshot?.fullName || "Your provider";
    const patientName = booking.patientSnapshot?.patientName || booking.patientName || "A patient";
    const dateStr = booking.scheduledTime?.slot
      ? `${booking.scheduledTime.slot}`
      : "";

    const bodyMap = {
      [NOTIFICATION_TYPES.BOOKING_NEW]:
        `${patientName} has requested a booking${dateStr ? ` for ${dateStr}` : ""}.`,
      [NOTIFICATION_TYPES.BOOKING_APPROVED]:
        `Your booking with ${providerName}${dateStr ? ` at ${dateStr}` : ""} has been confirmed.`,
      [NOTIFICATION_TYPES.BOOKING_REJECTED]:
        `Your booking with ${providerName}${dateStr ? ` at ${dateStr}` : ""} was declined.`,
      [NOTIFICATION_TYPES.BOOKING_CANCELLED]:
        `Booking${dateStr ? ` at ${dateStr}` : ""} has been cancelled.`,
      [NOTIFICATION_TYPES.BOOKING_RESCHEDULED]:
        `Your booking has been rescheduled. New slot: ${dateStr || "check dashboard"}.`,
      [NOTIFICATION_TYPES.SESSION_LINK_SHARED]:
        `${providerName} has shared the session link for your appointment.`,
      [NOTIFICATION_TYPES.SESSION_COMPLETED]:
        `Your session${dateStr ? ` at ${dateStr}` : ""} has been completed.`,
    };

    const body = bodyMap[type] || "You have a booking update.";

    const sends = [];

    // Who needs to receive this notification?
    switch (type) {
      case NOTIFICATION_TYPES.BOOKING_NEW:
        // Provider receives
        if (providerUserId) {
          sends.push(NotificationService.send({
            io, recipientId: providerUserId, type, body,
            data: { ...sharedData, redirectPath: "/dashboard?tab=appointments" },
          }));
        }
        break;

      case NOTIFICATION_TYPES.BOOKING_APPROVED:
      case NOTIFICATION_TYPES.BOOKING_REJECTED:
      case NOTIFICATION_TYPES.SESSION_LINK_SHARED:
        // Patient receives
        if (patientId) {
          sends.push(NotificationService.send({
            io, recipientId: patientId, type, body,
            data: { ...sharedData, redirectPath: "/dashboard?tab=bookings" },
          }));
        }
        break;

      case NOTIFICATION_TYPES.BOOKING_CANCELLED:
      case NOTIFICATION_TYPES.BOOKING_RESCHEDULED:
      case NOTIFICATION_TYPES.SESSION_COMPLETED:
        // Both receive
        if (patientId) {
          sends.push(NotificationService.send({
            io, recipientId: patientId, type, body,
            data: { ...sharedData, redirectPath: "/dashboard?tab=bookings" },
          }));
        }
        if (providerUserId) {
          sends.push(NotificationService.send({
            io, recipientId: providerUserId, type, body,
            data: { ...sharedData, redirectPath: "/dashboard?tab=appointments" },
          }));
        }
        break;

      default:
        break;
    }

    return Promise.allSettled(sends);
  }

  // ─── Domain helper: Claim Profile ────────────────────────────────────────────

  /**
   * @param {object} io
   * @param {object} opts
   * @param {object} opts.claimRequest    — TherapistClaimRequest mongoose document
   * @param {string} opts.status          — New status (submitted|under_review|approved|rejected)
   * @param {string} opts.recipientId     — User._id of the therapist (or admin for submission)
   * @param {string} [opts.rejectionReason]
   */
  static async sendClaimNotification(io, { claimRequest, status, recipientId, rejectionReason }) {
    const claimId = claimRequest._id?.toString();

    const typeMap = {
      submitted: NOTIFICATION_TYPES.CLAIM_SUBMITTED,
      under_review: NOTIFICATION_TYPES.CLAIM_UNDER_REVIEW,
      approved: NOTIFICATION_TYPES.CLAIM_APPROVED,
      rejected: NOTIFICATION_TYPES.CLAIM_REJECTED,
    };

    const type = typeMap[status];
    if (!type) return null;

    const bodyMap = {
      submitted: "Your profile claim has been submitted. Our team will review it shortly.",
      under_review: "Your claim is now being reviewed by our verification team.",
      approved: "🎉 Congratulations! Your profile claim has been approved. You can now access your full provider dashboard.",
      rejected: `Your profile claim was rejected${rejectionReason ? `: ${rejectionReason}` : ". Please review and resubmit."}.`,
    };

    const data = {
      claimId,
      redirectPath: "/verify",
      ...(rejectionReason && { rejectionReason }),
    };

    // For claim_submitted, also notify all admins
    if (status === "submitted") {
      try {
        const admins = await User.find({ isAdmin: true }).select("_id").lean();
        const adminIds = admins.map((a) => a._id.toString());
        if (adminIds.length > 0) {
          await NotificationService.sendBulk({
            io,
            recipientIds: adminIds,
            type: NOTIFICATION_TYPES.CLAIM_SUBMITTED,
            body: `A new therapist profile claim has been submitted and is awaiting your review.`,
            data: { claimId, redirectPath: "/admin/claims" },
          });
        }
      } catch (err) {
        console.error("[NotificationService] Failed to notify admins:", err.message);
      }
    }

    // Always notify the therapist too (except for the admin-only submitted case above)
    if (status !== "submitted") {
      return NotificationService.send({
        io,
        recipientId,
        type,
        body: bodyMap[status],
        data,
      });
    }

    // For submitted — notify the therapist that their submission was received
    return NotificationService.send({
      io,
      recipientId,
      type: NOTIFICATION_TYPES.CLAIM_UNDER_REVIEW,
      title: "Claim Submitted",
      body: "Your profile claim has been submitted and is pending review.",
      data,
    });
  }
}

export default NotificationService;
export { NOTIFICATION_TYPES };
