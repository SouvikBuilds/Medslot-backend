import { Doctor } from "../models/doctor.model.js";
import jwt from "jsonwebtoken";
import config from "../config/envConfig.js";
import { asyncHandler, ApiResponse, ApiError } from "../utils/index.js";
import { isValidObjectId } from "mongoose";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/index.js";

const generateAccessRefreshToken = async (doctorId) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log("No Doctor found with this id");
      throw new ApiError(404, "Doctor not found");
    }
    const accessToken = doctor.generateAccessToken(doctorId);
    const refreshToken = doctor.generateRefreshToken(doctorId);

    doctor.refreshToken = refreshToken;
    await doctor.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Error while generating access and refresh token.");
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token.",
    );
  }
};

const loginDoctor = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email.trim() === "" || password.trim() === "") {
    console.log("Email and password are required");
    throw new ApiError(400, "Email and password are required.");
  }

  const doctor = await Doctor.findOne({ email: email });
  if (!doctor) {
    console.log("No doctor found with this email");
    throw new ApiError(404, "Doctor not found with this email");
  }

  const isPasswordCorrect = await doctor.comparePassword(password);
  if (!isPasswordCorrect) {
    console.log("The password is not correct.");
    throw new ApiError(401, "Password not matched");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    doctor?._id,
  );

  const loggedInDoctor = await Doctor.findById(doctor._id).select(
    "-password -refreshToken",
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { loggedInDoctor, accessToken, refreshToken },
        "Doctor Login Successful",
      ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(incomingRefreshToken, config.refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const doctor = await Doctor.findById(decodedToken?._id);

  if (!doctor) {
    throw new ApiError(404, "Doctor does not exist");
  }

  if (incomingRefreshToken !== doctor.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessRefreshToken(doctor._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
});

const getCurrentDoctor = asyncHandler(async (req, res) => {
  const currentDoctor = req.doctor;
  return res
    .status(200)
    .json(new ApiResponse(200, currentDoctor, "Current doctor fetched"));
});

const logOutDoctor = asyncHandler(async (req, res) => {
  await Doctor.findByIdAndUpdate(
    req.doctor?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logout of doctor Successful"));
});

const getAllDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find()
    .sort({ createdAt: -1 })
    .select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, doctors, "Doctors fetched Successfully"));
});

const getDoctorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    console.log("No id provided");
    throw new ApiError(400, "Doctor id is required");
  }
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid doctor id");
  }
  const doctor = await Doctor.findById(id).select("-password -refreshToken");
  if (!doctor) throw new ApiError(404, "Doctor not found");
  return res.status(200).json(new ApiResponse(200, doctor, "Doctor Found"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { password, newPassword, confirmedPassword } = req.body;
  if (!password || !newPassword || !confirmedPassword) {
    console.log("All fields are required");
    throw new ApiError(400, "All fields are required");
  }

  if (newPassword !== confirmedPassword) {
    console.log("New password and confirmed password do not match");
    throw new ApiError(400, "New password and confirmed password do not match");
  }

  const doctor = await Doctor.findById(req.doctor?._id);
  if (!doctor) {
    console.log("no doctor found with this id");
    throw new ApiError(404, "No Doctor is found with this id");
  }

  const isPasswordCorrect = await doctor.comparePassword(password);
  if (!isPasswordCorrect) {
    console.log("Password is incorrect");
    throw new ApiError(400, "Password is incorrect");
  }

  doctor.password = newPassword;
  await doctor.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { experience, bio } = req.body;
  const id = req.doctor._id;

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    console.log("No doctor found with this id");
    throw new ApiError(404, "No Doctor is found with this id");
  }

  doctor.experience = experience || doctor.experience;
  doctor.bio = bio || doctor.bio;

  await doctor.save();

  const updatedDoctor = await Doctor.findById(id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedDoctor, "Profile updated successfully"));
});

const updateProfileImage = asyncHandler(async (req, res) => {
  const imagePath = req.file?.path;
  if (!imagePath) {
    console.log("No image file path provided.");
    throw new ApiError(400, "Image file is required");
  }

  const doctor = await Doctor.findById(req.doctor?._id);
  if (!doctor) {
    console.log("Doctor not found");
    throw new ApiError(404, "Doctor not found");
  }

  const imageUrl = await uploadOnCloudinary(imagePath);
  if (!imageUrl.secure_url) {
    console.log("Image url not found");
    throw new ApiError(404, "Image url is missing");
  }

  if (doctor.image) {
    await deleteFromCloudinary(doctor.image);
  }

  const response = await Doctor.findByIdAndUpdate(
    req.doctor._id,
    {
      $set: {
        image: imageUrl.secure_url,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, response, "Profile Picture Updated Succesfully"),
    );
});

const updateAvailability = asyncHandler(async (req, res) => {
  const { available } = req.body;

  const response = await Doctor.findByIdAndUpdate(
    req.doctor?._id,
    {
      $set: {
        available: available,
      },
    },
    { new: true, runValidators: true },
  ).select("-password -refreshToken");

  if (!response) {
    console.log("Doctor not found");
    throw new ApiError(404, "Doctor not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Availability changed successfully"));
});
export {
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
};
