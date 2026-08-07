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
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/login", loginAdmin);

router.get("/dashboard", verifyJWT, getAdminDashboard);

router.get("/users", verifyJWT, getAllUsers);
router.delete("/users/:id", verifyJWT, deleteUser);

router.get("/doctors", verifyJWT, getAllDoctors);

router.post(
  "/doctors",
  verifyJWT,
  upload.single("image"), // IMPORTANT
  registerDoctor,
);

router.delete("/doctors/:id", verifyJWT, deleteDoctor);

router.get("/messages", verifyJWT, getAllMessages);
router.get("/messages/:id", verifyJWT, getMessageById);
router.delete("/messages/:id", verifyJWT, deleteMessage);

export default router;
