import express from "express";
import {
  createTicket,
  getMyTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  getAllTickets,
    replyTicket,
      getLatestTickets,
} from "../controller/help.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-ticket", verifyAdminToken, createTicket);
router.get("/my-tickets", verifyAdminToken, getMyTickets);
router.get("/ticket/:id", verifyAdminToken, getTicket);
router.put("/update-ticket/:id", verifyAdminToken, updateTicket);
router.delete("/delete-ticket/:id", verifyAdminToken, deleteTicket);
router.get("/all-tickets",verifyAdminToken, getAllTickets);
router.post(
  "/reply-ticket/:id",
  verifyAdminToken,
  replyTicket
);

router.get(
  "/latest-tickets",
  verifyAdminToken,
  getLatestTickets
);

export default router;