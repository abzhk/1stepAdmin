import express from "express";
import { getProviders ,getProviderId,getProviderById} from "../controller/provider.controller.js";

const router = express.Router();

router.get("/getProviders", getProviders);

//provider by id
router.get("/providersbyid/:id", getProviderById);


export default router;
