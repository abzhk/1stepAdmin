import express from 'express';
import { getBookingProvider,
    getAllRecentBookings,
     getSessionCount,
 } from '../controller/booking.controller.js';
 import { verifyAdminToken } from '../middlewares/authMiddleware.js';


const router = express.Router();


router.get("/getbookingbyprovider/:id", getBookingProvider);
//recent bookings
router.get("/recent", verifyAdminToken,getAllRecentBookings);
//session count
router.get("/sessions/count", getSessionCount);


export default router;  