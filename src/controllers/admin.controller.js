import { Message } from "../models/message.model.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import { Appointment } from "../models/appointment.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import {
  asyncHandler,
  ApiError,
  ApiResponse,
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/index.js";
import { generateAccessAndRefreshToken } from "./user.controller.js";
import { sendMail } from "../service/mail.service.js";

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .sort({ createdAt: -1 })
    .select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched Successfully"));
});

const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find()
    .sort({ createdAt: -1 })
    .select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, doctors, "Doctors fetched Successfully"));
});
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalDoctors, totalMessages, appointments] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      Doctor.countDocuments(),
      Message.countDocuments(),
      Appointment.find()
        .populate("doctor", "name image")
        .populate("patient", "name image")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

  const totalAppointments = await Appointment.countDocuments();
  const totalRevenue = await Appointment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalDoctors,
        totalMessages,
        totalAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
        latestAppointments: appointments,
      },
      "Dashboard fetched successfully",
    ),
  );
});

const registerDoctor = asyncHandler(async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  const {
    name,
    email,
    password,
    speciality,
    degree,
    address,
    experience,
    fees,
    about,
  } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !speciality ||
    !degree ||
    !address ||
    !experience ||
    !fees ||
    !about
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const doctorExistence = await Doctor.findOne({ email });

  if (doctorExistence) {
    throw new ApiError(400, "Doctor already exists");
  }

  let imageUrl = "";

  if (req.file?.path) {
    const uploadedImage = await uploadOnCloudinary(req.file.path);

    if (!uploadedImage) {
      throw new ApiError(500, "Image upload failed");
    }

    imageUrl = uploadedImage.secure_url;
  }

  const newDoctor = await Doctor.create({
    name,
    email,
    password,
    speciality,
    degree,
    address,
    experience,
    fees,
    about,
    image: imageUrl,
  });

  const mailOptions = {
    from: `"Medslot" <csouvik2006@gmail.com>`,
    to: newDoctor.email,
    subject: "Your Medslot Doctor Account Credentials",
    html: `
      <h2>Hello Dr. ${newDoctor.name},</h2>

      <p>Your account has been created successfully.</p>

      <div style="background:#f5f5f5;padding:15px;border-radius:8px;">
          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${password}</p>
      </div>

      <p>Please change your password after logging in.</p>
    `,
  };

  await sendMail(mailOptions);

  const createdDoctor = await Doctor.findById(newDoctor._id).select(
    "-password -refreshToken",
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdDoctor, "Doctor registered successfully"),
    );
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    console.log("Not valid object id");
    throw new ApiError(400, "Object id of doctor is invalid");
  }

  const response = await Doctor.findByIdAndDelete(id);
  if (!response) {
    console.log("No doctor with this id found.");
    throw new ApiError(404, "Doctor with this id not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, response, "Doctor deleted Successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    console.log("Not valid user id");
    throw new ApiError(400, "Invalid user id");
  }
  const response = await User.findByIdAndDelete(id);
  if (!response) {
    console.log("No user with this id found");
    throw new ApiError(404, "User not found with this id");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, response, "User is deleted Successfully"));
});

const getAllMessages = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const [messages, totalMessages] = await Promise.all([
    Message.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Message.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages,
        pagination: {
          totalItems: totalMessages,
          totalPages: Math.ceil(totalMessages / limit),
          currentPage: page,
          limit,
          hasNextPage: page < Math.ceil(totalMessages / limit),
          hasPrevPage: page > 1,
        },
      },
      "All messages fetched successfully",
    ),
  );
});

const getMessageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    console.log("Invalid message id");
    throw new ApiError(400, "Not valid message id");
  }
  const message = await Message.findById(id).populate("user", "name email");
  if (!message) {
    console.log("No message found with this id");
    throw new ApiError(404, "Message doesn't exist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message Found Successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    console.log("Message id is invalid");
    throw new ApiError(400, "Message id invalid");
  }

  const response = await Message.findByIdAndDelete(id);
  if (!response) {
    console.log("Message not found");
    throw new ApiError(404, "Message not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, response, "Message deleted Successfully"));
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({
    email: email.trim(),
    role: "admin",
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
  console.log(user);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        "User logged in successfully",
      ),
    );
});
export {
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
};
