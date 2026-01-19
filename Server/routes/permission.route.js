import express from "express";
import { addPermission, getPermissions ,updateRolePermissions} from "../controller/permission.controller.js";

const router = express.Router();

router.post("/add", addPermission);
router.get("/all", getPermissions);
router.put("/update-permissions", updateRolePermissions);


export default router;
