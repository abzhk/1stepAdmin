import express from 'express';
import { getallparents,parentstats,getParent } from '../controller/parent.controller.js';


const router = express.Router();
router.get("/getallparents", getallparents);
//stats
router.get("/parent/:parentId/stats", parentstats)
//getparentby id
router.get("/getparent/:id", getParent);

export default router;