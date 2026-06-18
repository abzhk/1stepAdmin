import express from'express';
import  statsRouter from './stats.route.js';
import categoryRouter from './category.route.js'
import articleRouter from './article.route.js'
import adminRoute from './admin.route.js'
import assessmentRoute from './assessment.route.js';
import providerRoute from './provider.route.js'
import bookingRoute from './booking.route.js'
import parentRoute from './parent.route.js'
// import SuperAdminRoute from './superadmin.route.js';
import AuthRoute from './auth.route.js';
import Permission from './permission.route.js';
import role from './role.route.js'
import PlanRoute from './plan.route.js'
import accessRoutes from './access.route.js';
import userRoute from './user.route.js';
import moduleRoute from './module.route.js';
import masterRoute from './masterData.route.js';
import subscriptionRoute from "./subscription.route.js"
import invitedRoute from "./centre.route.js"
import claimProfile from "./claimProfile.route.js"
import notificationRoute from "./notification.route.js"
import assessmentquestionsRoute from "./assessmentquestion.route.js"
import helpdeskRoute from "./help.route.js"
import contactRoute from "./contact.route.js"

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
//superadmin route
// router.use('/superadmin',SuperAdminRoute)
//auth route
router.use('/auth',AuthRoute)
//permission
router.use('/permission',Permission);
//role
router.use("/role", role);
//plan route
router.use('/plan',PlanRoute)
//access permission by admin
router.use("/access", accessRoutes);
//user route
router.use("/users", userRoute);
//modules
router.use("/module",moduleRoute);
//service typrs
router.use("/services",masterRoute)
//subscriptiob
router.use("/subscription",subscriptionRoute)
//invite provider
router.use("/invite",invitedRoute)
//claimprofile
router.use("/claim", claimProfile)
//notification
router.use("/notifications", notificationRoute)
//assessment questions
router.use("/assessmentquestions", assessmentquestionsRoute)
//helpdesk
router.use("/help",helpdeskRoute);
//contactus
router.use("/contact",contactRoute);



export default router;