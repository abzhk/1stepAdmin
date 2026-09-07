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
  getAllUsers,
  deactivateUser,
  reactivateUser,
  getUserStatusHistory,
} from "../controller/user.controller.js";
import { validatePassword } from "../validator/joi.js";

const router = express.Router();

// ── Existing routes ───────────────────────────────────────────────────────────
router.get("/", test);
router.post("/update/:id", verifyToken, updateUser);
router.post("/resetpassword/:id", verifyToken, validatePassword, resetPassword);
router.get("/providers/:id", verifyToken, getUserProvider);
router.get("/getusers", verifyToken, getUsers);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.get("/users", getAllUsers);
router.post("/errorlog", saveErrorLog);

// ── SaaS Account Lifecycle — Admin-only ───────────────────────────────────────
// Note: verifyToken validates JWT; req.user.isAdmin is checked inside the handler.
// If you have a dedicated isAdmin middleware, chain it here too.
router.post("/deactivate/:userId", verifyToken, deactivateUser);
router.post("/reactivate/:userId", verifyToken, reactivateUser);
router.get("/status-history/:userId", verifyToken, getUserStatusHistory);

// ── User lookup (keep last — wildcard) ───────────────────────────────────────
router.get("/:id", verifyToken, getUser);

export default router;
