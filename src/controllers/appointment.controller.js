import { Appointment } from "../models/appointment.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";
import { Doctor } from "../models/doctor.model.js";


