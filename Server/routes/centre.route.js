import express from "express";

import {
  getAllInvtedProviders ,
    getRecentCentresForAdmin,
    getCentresForAdmin,
     getAllCentreDashboardStats,
      getCentreDashboardStats,
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


router.get("/centre-list", getCentresForAdmin);

router.get(
  "/dashboard-stats",
  getCentreDashboardStats
);

export default router;