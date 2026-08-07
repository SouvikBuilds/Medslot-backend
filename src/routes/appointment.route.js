import { Router } from "express";
import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
  markAppointmentComplete,
  doctorCancelAppointment,
  getDoctorDashboard,
  getAllAppointments,
  adminCancelAppointment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getBookedSlots,
} from "../controllers/appointment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyDoctorJWT } from "../middlewares/doctor.middleware.js";

const router = Router();

// Public
router.get("/booked-slots", getBookedSlots);

// Patient routes
router.post("/book", verifyJWT, bookAppointment);
router.get("/my-appointments", verifyJWT, getMyAppointments);
router.patch("/cancel/:id", verifyJWT, cancelAppointment);
router.post("/razorpay/create-order", verifyJWT, createRazorpayOrder);
router.post("/razorpay/verify", verifyJWT, verifyRazorpayPayment);

// Doctor routes
router.get("/doctor-appointments", verifyDoctorJWT, getDoctorAppointments);
router.get("/doctor-dashboard", verifyDoctorJWT, getDoctorDashboard);
router.patch("/complete/:id", verifyDoctorJWT, markAppointmentComplete);
router.patch("/doctor-cancel/:id", verifyDoctorJWT, doctorCancelAppointment);

// Admin routes
router.get("/all", verifyJWT, getAllAppointments);
router.patch("/admin-cancel/:id", verifyJWT, adminCancelAppointment);

export default router;
