import { Router } from "express";
import { register, login, refresh, profile, logout } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/profile", authenticate, profile);
router.post("/logout", authenticate, logout);

export default router;
