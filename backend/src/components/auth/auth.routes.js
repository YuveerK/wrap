import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "./auth.controller.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, refreshSchema } from "./auth.schemas.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." } },
});

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), authController.register);
router.get("/verify/:token", authController.verifyEmail);
router.post("/login", authLimiter, validateBody(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);
router.post("/refresh", validateBody(refreshSchema), authController.refresh);
router.post("/logout", validateBody(refreshSchema), authController.logout);
router.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password/:token", authLimiter, validateBody(resetPasswordSchema), authController.resetPassword);

export default router;
