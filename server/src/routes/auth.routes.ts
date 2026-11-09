import { Router } from "express";
import { registerUser, loginUser, forgotPassword } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);

export default router;