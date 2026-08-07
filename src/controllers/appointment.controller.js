import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import config from "../config/envConfig.js";

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

// Book appointment
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, appointmentDate, slot } = req.body;
  const patientId = req.user._id;

  if (!doctorId || !appointmentDate || !slot) {
    throw new ApiError(400, "Doctor, date and slot are required");
  }

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctor id");
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");
  if (!doctor.available) throw new ApiError(400, "Doctor is not available");

  const date = new Date(appointmentDate);

  // Prevent duplicate booking
  const existing = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate: date,
    slot,
    status: { $ne: "cancelled" },
  });
  if (existing) throw new ApiError(409, "This slot is already booked");

  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    appointmentDate: date,
    slot,
    amount: doctor.fees,
  });

  const populated = await Appointment.findById(appointment._id)
    .populate("doctor", "-password -refreshToken")
    .populate("patient", "-password -refreshToken -magicToken");

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Appointment booked successfully"));
});

// Get patient's appointments
const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate("doctor", "-password -refreshToken")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, appointments, "Appointments fetched"));
});

// Cancel appointment (patient)
const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid appointment id");

  const appointment = await Appointment.findById(id);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  if (appointment.status === "cancelled") {
    throw new ApiError(400, "Appointment already cancelled");
  }

  appointment.status = "cancelled";
  await appointment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, "Appointment cancelled"));
});

// Get doctor's appointments
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ doctor: req.doctor._id })
    .populate("patient", "-password -refreshToken -magicToken")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, appointments, "Doctor appointments fetched"));
});

// Doctor: mark complete
const markAppointmentComplete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid appointment id");

  const appointment = await Appointment.findById(id);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  if (appointment.doctor.toString() !== req.doctor._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  appointment.status = "completed";
  await appointment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, "Appointment marked complete"));
});

// Doctor: cancel appointment
const doctorCancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid appointment id");

  const appointment = await Appointment.findById(id);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  if (appointment.doctor.toString() !== req.doctor._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  appointment.status = "cancelled";
  await appointment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, "Appointment cancelled"));
});

// Get doctor dashboard stats
const getDoctorDashboard = asyncHandler(async (req, res) => {
  const doctorId = req.doctor._id;

  const appointments = await Appointment.find({ doctor: doctorId })
    .populate("patient", "name image dob")
    .sort({ createdAt: -1 });

  const earnings = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.amount, 0);

  const patientIds = [
    ...new Set(appointments.map((a) => a.patient?._id?.toString())),
  ];

  const latest = appointments.slice(0, 5);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        earnings,
        totalAppointments: appointments.length,
        totalPatients: patientIds.length,
        latestAppointments: latest,
      },
      "Doctor dashboard fetched",
    ),
  );
});

// Admin: get all appointments
const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate("doctor", "-password -refreshToken")
    .populate("patient", "-password -refreshToken -magicToken")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, appointments, "All appointments fetched"));
});

// Admin: cancel appointment
const adminCancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid appointment id");

  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { status: "cancelled" },
    { new: true },
  );
  if (!appointment) throw new ApiError(404, "Appointment not found");

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, "Appointment cancelled"));
});

// Razorpay: create order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  if (!isValidObjectId(appointmentId))
    throw new ApiError(400, "Invalid appointment id");

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  const order = await razorpay.orders.create({
    amount: appointment.amount * 100,
    currency: "INR",
    receipt: `receipt_${appointmentId}`,
  });

  appointment.razorpayOrderId = order.id;
  await appointment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { order, appointment }, "Order created"));
});

// Razorpay: verify payment
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed");
  }

  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, "Payment verified successfully"));
});

// Get booked slots for a doctor on a date
const getBookedSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) throw new ApiError(400, "doctorId and date required");

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: start, $lte: end },
    status: { $ne: "cancelled" },
  }).select("slot");

  const bookedSlots = appointments.map((a) => a.slot);

  return res
    .status(200)
    .json(new ApiResponse(200, bookedSlots, "Booked slots fetched"));
});

export {
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
};
