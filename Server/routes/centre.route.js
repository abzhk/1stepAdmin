import express from "express";

import {
  getAllInvtedProviders ,
    getRecentCentresForAdmin,
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

export default router;