import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controller/notification.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// All notification routes require authentication
router.use(verifyToken);

// Inbox & count
router.get("/",            getNotifications);       // GET    /server/notifications
router.get("/unread-count", getUnreadCount);        // GET    /server/notifications/unread-count

// Mark read
router.patch("/read-all",  markAllAsRead);          // PATCH  /server/notifications/read-all
router.patch("/:id/read",  markAsRead);             // PATCH  /server/notifications/:id/read

// Delete
router.delete("/clear-all", clearAllNotifications); // DELETE /server/notifications/clear-all
router.delete("/:id",       deleteNotification);    // DELETE /server/notifications/:id

export default router;
