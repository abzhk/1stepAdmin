import express from 'express';
import { getallparents,parentstats,getParent,createParent,
    setParentActiveStatus,
 } from '../controller/parent.controller.js';
import { verifyAdminToken } from "../middlewares/authMiddleware.js";


const router = express.Router();
router.get("/getallparents", getallparents);
//stats
router.get("/parent/:parentId/stats",verifyAdminToken, parentstats)
//getparentby id
router.get("/getparent/:id", getParent);
//create Parent
router.post("/createparent/:id",createParent);
//activate or deactivate parent by admin
router.put("/admin/parent/status", setParentActiveStatus);


export default router;