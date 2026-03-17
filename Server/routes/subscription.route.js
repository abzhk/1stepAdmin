import express from "express"
import { getSubscriptionStats } from "../controller/plan/subscription.controller.js";


const router=express.Router()

router.get("/getcount",getSubscriptionStats)


export default router;