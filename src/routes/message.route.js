import {
  sendMessage,
  getMyMessages,
} from "../controllers/message.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/send-message").post(sendMessage);
router.route("/my-messages").get(verifyJWT, getMyMessages);

export default router;
