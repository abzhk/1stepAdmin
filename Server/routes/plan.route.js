import express from "express";
import { createPlan ,
    getPlans ,
     getPlanById,
     updatePlan,
        deletePlan,
} from "../controller/plan.controller.js";
import {verifyAdminToken} from '../middlewares/authMiddleware.js';

const router  = express.Router();
router.post("/create", verifyAdminToken ,createPlan);
router.get("/get",verifyAdminToken, getPlans);
router.get("/:id",verifyAdminToken, getPlanById);
router.put("/update/:id",verifyAdminToken, updatePlan);
router.delete("/delete/:id", deletePlan);

export default router;