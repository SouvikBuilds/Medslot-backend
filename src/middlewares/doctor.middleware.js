import jwt from "jsonwebtoken";
import { asyncHandler, ApiError } from "../utils/index.js";
import config from "../config/envConfig.js";
import { Doctor } from "../models/doctor.model.js";

export const verifyDoctorJWT = asyncHandler(async (req, res, next) => {
  console.log("Cookies:", req.cookies);
  console.log("Access Token:", req.cookies?.accessToken);
  const token =
    req.cookies?.accessToken ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, config.accessToken);
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
