import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logOutUser,
  getUser,
  requestMagicLink,
  verifyMagicLink,
  updateProfile,
} from "../controllers/user.controller.js";
import {
  verifyJWT,
  magicAuthMiddleware,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/magic-link", magicAuthMiddleware, requestMagicLink);
router.post("/magic-login", verifyMagicLink);

// protected routes
router.post("/logout", verifyJWT, logOutUser);
router.get("/me", verifyJWT, getUser);
router.patch("/update-profile", verifyJWT, updateProfile);

export default router;
