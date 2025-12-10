import express from "express";
import { getProviders } from "../controller/provider.controller.js";

const router = express.Router();

router.get("/getProviders", getProviders);

export default router;
