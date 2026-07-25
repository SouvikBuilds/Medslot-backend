import {
  loginDoctor,
  refreshAccessToken,
  getCurrentDoctor,
  logOutDoctor,
  getAllDoctors,
  getDoctorById,
  changePassword,
  updateProfile,
  updateProfileImage,
  updateAvailability,
} from "../controllers/doctor.controller.js";

import { Router } from "express";
import { verifyDoctorJWT } from "../middlewares/doctor.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/").get(getAllDoctors);

router.route("/login").post(loginDoctor);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/me").get(verifyDoctorJWT, getCurrentDoctor);
router.route("/logout").post(verifyDoctorJWT, logOutDoctor);

router.route("/change-password").patch(verifyDoctorJWT, changePassword);
router.route("/update-profile").patch(verifyDoctorJWT, updateProfile);

router
  .route("/update-profile-image")
  .patch(verifyDoctorJWT, upload.single("image"), updateProfileImage);

router.route("/update-availability").patch(verifyDoctorJWT, updateAvailability);

router.route("/:id").get(getDoctorById);

export default router;
