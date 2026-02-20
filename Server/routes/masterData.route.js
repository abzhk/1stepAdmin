import express from "express";
import {
  getAllTypes,
  getOptionsByType,
  createOption,
    updateOption,
} from "../controller/masterController/masterData.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/types", getAllTypes); // get all available types
router.get("/:type", getOptionsByType); // get options by type

router.post("/create-service",verifyAdminToken, createOption);

// UPDATE
router.put("/:id", updateOption);

export default router;
