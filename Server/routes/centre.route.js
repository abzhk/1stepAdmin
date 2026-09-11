import express from "express";

import {
  getAllInvtedProviders ,
    getRecentCentresForAdmin,
    
     getAllCentreDashboardStats,
} from "../controller/centre.controller.js";

const router = express.Router();

router.get(
  "/centres/:centreId/invited-providers",
   getAllInvtedProviders 
);
router.get(
  "/recent-centres",
  getRecentCentresForAdmin
);

router.get("/centre-session",  getAllCentreDashboardStats);

export default router;