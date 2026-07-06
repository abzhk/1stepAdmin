import express from "express"

import { getAllContactMessages,
    replyToContact,
    getContactMessageById,
 } from "../controller/contact.controller.js"
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router= express.Router();

router.get("/getall",verifyAdminToken, getAllContactMessages);


router.get("/:id", verifyAdminToken, getContactMessageById);
router.post(
  "/reply/:id",
  verifyAdminToken,
  replyToContact
);


export default router;