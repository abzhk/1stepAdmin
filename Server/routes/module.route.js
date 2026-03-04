import express from "express";
import {
  createModule,
  getModules,
  updateModule,
  deleteModule,
} from "../controller/module.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create",verifyAdminToken, createModule);
router.get("/get-module",verifyAdminToken, getModules);
router.put("/update-module/:id",verifyAdminToken, updateModule);
router.delete("/delete-module/:id", deleteModule);

export default router;
