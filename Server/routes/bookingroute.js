import express from 'express';
import { getBookingProvider ,getProviderStats} from '../controller/bookingController.js';


const router = express.Router();


router.get('/getallbooking/:id', getProviderStats);
router.get("/getbookingbyprovider/:id", getBookingProvider);

export default router;  