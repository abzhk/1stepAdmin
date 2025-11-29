import express from'express';
import  statsRouter from './statsroute.js';
import categoryRouter from './categoryroute.js'
import articleRouter from './articleroute.js'
import adminRoute from './adminroute.js'
import assessmentRoute from './assessmentroute.js';

const router = express.Router(); 

//dashboard stats
router.use('/track',statsRouter);
//category
router.use('/category',categoryRouter)
//articles
router.use('/article',articleRouter)
//admin route
router.use('/admin',adminRoute)
//assessment route
router.use('/assessment',assessmentRoute)


export default router;