import jwt from "jsonwebtoken";
import { asyncHandler, ApiError } from "../utils/index.js";
import config from "../config/envConfig.js";
import { Doctor } from "../models/doctor.model.js";

export const verifyDoctorJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.doctorAccessToken ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, config.doctorAccessToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const doctor = await Doctor.findById(decodedToken._id).select(
    "-password -refreshToken",
  );

  if (!doctor) {
    throw new ApiError(401, "Invalid access token");
  }

  req.doctor = doctor;

  next();
});
