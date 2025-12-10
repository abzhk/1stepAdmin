import express from'express';
import  statsRouter from './stats.route.js';
import categoryRouter from './category.route.js'
import articleRouter from './article.route.js'
import adminRoute from './admin.route.js'
import assessmentRoute from './assessment.route.js';
import providerRoute from './provider.route.js'
import bookingRoute from './booking.route.js'
import parentRoute from './parent.route.js'

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
//provider route
router.use('/provider',providerRoute)
//booking route
router.use('/booking',bookingRoute)
//parent route
router.use('/parent',parentRoute)


export default router;