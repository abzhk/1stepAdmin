import express from 'express';
import { getallparents,parentstats,getParent,createParent,
    setParentActiveStatus,
    getInactiveParents,
     getParentBookings,
 } from '../controller/parent.controller.js';
import { verifyAdminToken } from "../middlewares/authMiddleware.js";


const router = express.Router();
router.get("/getallparents",verifyAdminToken, getallparents);
//stats
router.get("/parent/:parentId/stats",verifyAdminToken, parentstats)
//getparentby id
router.get("/getparent/:id", getParent);
//create Parent
router.post("/createparent/:id",createParent);
//activate or deactivate parent by admin
router.put("/admin/parent/status", setParentActiveStatus);
//get inactive parents
router.get("/inactive-parents", getInactiveParents);
//bookings of parent
router.get("/bookings/:parentId",verifyAdminToken, getParentBookings);




export default router;