import express from 'express';
import { getBookingProvider } from '../controller/booking.controller.js';


const router = express.Router();


router.get("/getbookingbyprovider/:id", getBookingProvider);

export default router;  