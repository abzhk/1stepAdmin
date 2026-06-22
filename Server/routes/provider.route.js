import express from "express";
import { getProviders ,
    getProviderById,
    getProviderStats,
    setProviderActiveStatus,
    getInactiveProviders,
    getCentreAppointments,
    getCentresForAdmin,
    getCentreStats,
getIndividualProviders,getAllCentreDashboardStats,
getMonthlyAppointments,
getCentreById,
getCentreFullDetails,
updateCentreByAdmin,setCentreActiveStatus,
getInactiveCentres,
deleteCentre,
} from "../controller/provider.controller.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/getProviders",verifyAdminToken, getProviders);

//provider by id
router.get("/providersbyid/:id",verifyAdminToken, getProviderById);
//provider stats 
router.get('/getallbooking/:id', verifyAdminToken, getProviderStats);
//deactivate
router.put("/admin/provider/status",verifyAdminToken, setProviderActiveStatus);
//inactive -provider list
router.get("/inactive-providers",  verifyAdminToken, getInactiveProviders);
//center-appointments
router.get("/centre-appointments", verifyAdminToken, getCentreAppointments);
//get centre list for admin
router.get("/centre-list",verifyAdminToken,getCentresForAdmin);
router.get("/centre-stats", verifyAdminToken, getCentreStats);
router.get("/individual-list", verifyAdminToken, getIndividualProviders);
router.get("/centre-session", verifyAdminToken, getAllCentreDashboardStats);

router.get("/appointments/monthly", verifyAdminToken, getMonthlyAppointments);
//delete centre
router.delete("/centre/:id",verifyAdminToken, deleteCentre);

router.put("/centre/set-active-status",verifyAdminToken,setCentreActiveStatus);
//inactive centres list
router.get("/centre/inactive-list", verifyAdminToken, getInactiveCentres);

router.get("/centre/:id", verifyAdminToken, getCentreById);


router.get("/centre-details/:id",  verifyAdminToken, getCentreFullDetails);

router.put("/centre/:id", verifyAdminToken,updateCentreByAdmin);



export default router;
