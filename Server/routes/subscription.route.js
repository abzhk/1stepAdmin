import express from "express"
import { getExpiredUsers, 
    getSubscriptionStats,
 } from "../controller/plan/subscription.controller.js";


const router=express.Router()

router.get("/getcount",getSubscriptionStats)

//expired user count
router.get("/expired",getExpiredUsers)


export default router;