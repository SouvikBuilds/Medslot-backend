import {
  getAllUsers,
  getAllDoctors,
  getAdminDashboard,
  registerDoctor,
  deleteDoctor,
  getAllMessages,
  getMessageById,
  deleteMessage,
  deleteUser,
  loginAdmin,
} from "../controllers/admin.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/login").post(loginAdmin);

router.route("/dashboard").get(verifyJWT, getAdminDashboard);

router.route("/users").get(verifyJWT, getAllUsers);
router.route("/users/:id").delete(verifyJWT, deleteUser);

router.route("/doctors").get(verifyJWT, getAllDoctors);
router.route("/doctors").post(verifyJWT, registerDoctor);
router.route("/doctors/:id").delete(verifyJWT, deleteDoctor);

router.route("/messages").get(verifyJWT, getAllMessages);
router.route("/messages/:id").get(verifyJWT, getMessageById);
router.route("/messages/:id").delete(verifyJWT, deleteMessage);

export default router;
