import express from 'express';
import  {getStats} from '../controller/statscontroller.js';
import {verifyAdminToken} from '../middlewares/authMiddleware.js';

const router = express.Router()

router.get('/stats',verifyAdminToken,getStats)

export default router;