import mongoose, { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config/envConfig.js";

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minLength: 3,
    },

    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is Required"],
      minLength: 6,
    },

    image: {
      type: String,
    },

    speciality: {
      type: String,
      enum: [
        "General Physician",
        "Gynecologist",
        "Dermatologist",
        "Pediatricians",
        "Neurologist",
        "Gastroenterologist",
      ],
      default: "General Physician",
    },

    degree: {
      type: String,
      enum: [
        "MBBS",
        "MD",
        "MS",
        "DM",
        "MCh",
        "BDS",
        "MDS",
        "BAMS",
        "BHMS",
        "BUMS",
        "DNB",
      ],
      default: "MBBS",
    },

    experience: {
      type: Number,
      default: 0,
    },

    about: {
      type: String,
      required: [true, "About is required"],
    },

    fees: {
      type: Number,
      default: 500,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
    },

    available: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

doctorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

doctorSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

doctorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    config.accessToken,
    { expiresIn: config.accessTokenExpiry },
  );
};

doctorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    config.refreshToken,
    { expiresIn: config.regfreshTokenExpiry },
  );
};

export const Doctor = model("Doctor", doctorSchema);
