import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logOutUser,
  getUser,
  requestMagicLink,
  verifyMagicLink,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/magic-link", requestMagicLink);
router.post("/magic-login", verifyMagicLink);

// protected routes
router.post("/logout", verifyJWT, logOutUser);
router.get("/me", verifyJWT, getUser);

export default router;
