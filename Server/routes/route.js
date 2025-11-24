import express from'express';
import  statsRouter from './statsroute.js';
import categoryRouter from './categoryroute.js';


const router = express.Router();  

router.use('/track',statsRouter);
router.use('/category',categoryRouter)


export default router;