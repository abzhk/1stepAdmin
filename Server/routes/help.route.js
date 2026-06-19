import express from "express";
import {
  createTicket,
  getMyTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  getAllTickets,
    replyTicket,
} from "../controller/help.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-ticket", verifyAdminToken, createTicket);
router.get("/my-tickets", verifyAdminToken, getMyTickets);
router.get("/ticket/:id", verifyAdminToken, getTicket);
router.put("/update-ticket/:id", verifyAdminToken, updateTicket);
router.delete("/delete-ticket/:id", verifyAdminToken, deleteTicket);
router.get("/all-tickets", getAllTickets);
router.post(
  "/reply-ticket/:id",
  verifyAdminToken,
  replyTicket
);

export default router;