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
//get centre list for admin
router.get("/centre-list",getCentresForAdmin);
router.get("/centre-stats", getCentreStats);
router.get("/individual-list", getIndividualProviders);
router.get("/centre-session", getAllCentreDashboardStats);

router.get("/appointments/monthly", getMonthlyAppointments);
router.delete("/centre/:id", deleteCentre);

router.put(
  "/centre/set-active-status",
  setCentreActiveStatus
);

router.get("/centre/inactive-list", getInactiveCentres);

router.get("/centre/:id", getCentreById);


router.get("/centre-details/:id",  getCentreFullDetails);

router.put("/centre/:id", verifyAdminToken,updateCentreByAdmin);



export default router;
