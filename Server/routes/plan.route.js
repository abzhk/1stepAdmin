import express from "express";
import { createPlan ,
    getPlans ,
     getPlanById,
     updatePlan,
        deletePlan,
} from "../controller/plan.controller.js";

const router  = express.Router();
router.post("/create", createPlan);
router.get("/get", getPlans);
router.get("/:id", getPlanById);
router.put("/update/:id", updatePlan);
router.delete("/delete/:id", deletePlan);

export default router;