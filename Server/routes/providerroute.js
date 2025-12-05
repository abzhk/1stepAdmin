import express from "express";
import { getProviders } from "../controller/providerController.js";

const router = express.Router();

router.get("/getProviders", getProviders);

export default router;
