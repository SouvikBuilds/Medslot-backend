import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler, ApiError } from "../utils/index.js";
import config from "../config/envConfig.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
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

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken -magicToken",
  );

  if (!user) {
    throw new ApiError(401, "Invalid access token");
  }

  req.user = user;

  next();
});

export const magicAuthMiddleware = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    return next();
  }
  try {
    jwt.verify(token, config.accessToken);
  } catch (error) {
    return next();
  }
  throw new ApiError(403, "Already loggedin");
});
