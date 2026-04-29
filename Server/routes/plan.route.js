import express from "express";
import { createPlan ,
    getPlans ,
     getPlanById,
     updatePlan,
        deletePlan,
        getFeaturedPlan
} from "../controller/plan/plan.controller.js";
import {verifyAdminToken} from '../middlewares/authMiddleware.js';
import { canAccess } from "../middlewares/permission.middleware.js";
import { MODULES, ACTIONS } from "../constants/permissions.js";

const router  = express.Router();
router.post("/create", verifyAdminToken, canAccess(MODULES.PLANS, ACTIONS.CREATE) ,createPlan);
router.get("/get",verifyAdminToken, canAccess(MODULES.PLANS, ACTIONS.READ), getPlans);
router.get("/featured", verifyAdminToken, canAccess(MODULES.PLANS, ACTIONS.READ), getFeaturedPlan);
router.get("/:id",verifyAdminToken, canAccess(MODULES.PLANS, ACTIONS.READ), getPlanById);
router.put("/update/:id",verifyAdminToken, canAccess(MODULES.PLANS, ACTIONS.UPDATE), updatePlan);
router.delete("/delete/:id", verifyAdminToken, canAccess(MODULES.PLANS, ACTIONS.DELETE), deletePlan);


export default router;