import express from "express";

import {
  getAllInvtedProviders ,
} from "../controller/centre.controller.js";

const router = express.Router();

router.get(
  "/centres/:centreId/invited-providers",
   getAllInvtedProviders 
);

export default router;