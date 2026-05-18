import Notification from "../model/notification.model.js";
import { errorHandler } from "../utils/error.js";

const PAGE_LIMIT = 20;

// ─── GET /server/notifications ────────────────────────────────────────────────
// Paginated notification inbox for the authenticated user
export const getNotifications = async (req, res, next) => {
  try {
    const recipientId = req.user.id;
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || PAGE_LIMIT);
    const skip   = (page - 1) * limit;
    const filter = { recipient: recipientId };

    if (req.query.unreadOnly === "true") {
      filter.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /server/notifications/unread-count ───────────────────────────────────
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead:    false,
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /server/notifications/:id/read ────────────────────────────────────
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    ).lean();

    if (!notification) {
      return next(errorHandler(404, "Notification not found"));
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /server/notifications/read-all ────────────────────────────────────
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /server/notifications/:id ─────────────────────────────────────────
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id:       req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return next(errorHandler(404, "Notification not found"));
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /server/notifications (clear all) ─────────────────────────────────
export const clearAllNotifications = async (req, res, next) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.user.id });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notification(s) cleared`,
    });
  } catch (error) {
    next(error);
  }
};
