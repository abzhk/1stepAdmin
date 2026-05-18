import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  test,
  updateUser,
  getUserProvider,
  getUser,
  getUsers,
  deleteUser,
  resetPassword,
  saveErrorLog,
} from "../controller/user.controller.js";
import { validatePassword } from "../validator/joi.js";

const router = express.Router();

router.get("/", test);
router.post("/update/:id", verifyToken, updateUser);
router.post("/resetpassword/:id", verifyToken, validatePassword, resetPassword);
router.get("/providers/:id", verifyToken, getUserProvider);
router.get("/getusers", verifyToken, getUsers);
router.delete("/delete/:userId", verifyToken, deleteUser);

//user
router.post("/errorlog", saveErrorLog);

router.get("/:id", verifyToken, getUser);



export default router;
