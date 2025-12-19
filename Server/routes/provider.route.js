import express from "express";
import { getProviders ,getProviderById,getProviderStats} from "../controller/provider.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/getProviders", getProviders);

//provider by id
router.get("/providersbyid/:id", getProviderById);
//provider stats 
router.get('/getallbooking/:id', getProviderStats);


export default router;
