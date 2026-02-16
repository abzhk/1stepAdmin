import express from "express";
import {
  createModule,
  getModules,
  updateModule,
  deleteModule,
} from "../controller/module.controller.js";

const router = express.Router();

router.post("/create", createModule);
router.get("/get-module", getModules);
router.put("/update-module/:id", updateModule);
router.delete("/delete-module/:id", deleteModule);

export default router;
