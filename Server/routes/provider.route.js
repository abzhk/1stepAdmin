import express from "express";
import { getProviders ,
    getProviderById,
    getProviderStats,
    setProviderActiveStatus,
    getInactiveProviders,
    getCentreAppointments
} from "../controller/provider.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/getProviders", getProviders);

//provider by id
router.get("/providersbyid/:id", getProviderById);
//provider stats 
router.get('/getallbooking/:id', getProviderStats);
//deactivate
router.put("/admin/provider/status", setProviderActiveStatus);
//inactive -provider list
router.get("/inactive-providers",  getInactiveProviders);
//center-appointments
router.get("/centre-appointments", verifyAdminToken, getCentreAppointments);




export default router;
