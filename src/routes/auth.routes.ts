import { Router } from "express";
import {
  register,
  login,
  refresh,
  profile,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/profile", authenticate, profile);
router.post("/logout", authenticate, logout);

export default router;
