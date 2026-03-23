import express from "express";
import { createPlan ,
    getPlans ,
     getPlanById,
     updatePlan,
        deletePlan,
        getFeaturedPlan
} from "../controller/plan/plan.controller.js";
import {verifyAdminToken} from '../middlewares/authMiddleware.js';

const router  = express.Router();
router.post("/create", verifyAdminToken ,createPlan);
router.get("/get",verifyAdminToken, getPlans);
router.get("/featured", getFeaturedPlan);
router.get("/:id",verifyAdminToken, getPlanById);
router.put("/update/:id",verifyAdminToken, updatePlan);
router.delete("/delete/:id", deletePlan);


export default router;