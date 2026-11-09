import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getCurrentUser,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", isAuthenticated, getCurrentUser);
router.post("/logout", isAuthenticated, logoutUser);

export default router;