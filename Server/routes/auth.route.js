import express from "express";
import {
  google,
  signin,
  signup,
  signout,
  refreshAccessToken,
} from "../controller/auth.controller.js";
import {
  resetPassword,
  verifyOtpPassword,
} from "../controller/auth.controller.js";
import { validateLogin, validateUserCreate } from "../validator/Joi.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", validateLogin, signin);
router.post("/google", google);
router.get("/signout", signout);
router.get("/refresh", refreshAccessToken);
router.post("/otppassword", resetPassword);
router.post("/verifyOtp", verifyOtpPassword);

export default router;
