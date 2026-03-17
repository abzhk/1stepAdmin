import express from 'express';
import  {getStatistics, getStats} from '../controller/stats.controller.js';
import {verifyAdminToken} from '../middlewares/authMiddleware.js';

const router = express.Router()

router.get('/stats',verifyAdminToken,getStats)
//user count per month stats graph
router.get("/monthly",getStatistics)

export default router;