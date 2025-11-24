import express from 'express';
import  {getStats} from '../controller/statscontroller.js';

const router = express.Router()

router.get('/stats',getStats)

export default router;