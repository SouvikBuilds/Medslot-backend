import mongoose, { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/envConfig.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minLength: [3, "Name should be atleast 3 characters long."],
    },

    email: {
      type: String,
      unique: true,
      required: [true, "Email is Required"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: true,
      match: [
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
        "Enter a valid password",
      ],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    refreshToken: {
      type: String,
    },

    magicToken: {
      type: String,
    },

    phone: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["", "Male", "Female", "Other"],
      default: "",
    },

    dob: {
      type: String,
      default: "",
    },

    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    config.accessToken,
    {
      expiresIn: config.accessTokenExpiry,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    config.refreshToken,
    {
      expiresIn: config.regfreshTokenExpiry,
    },
  );
};

userSchema.methods.generateMagictoken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    config.magicToken,
    {
      expiresIn: config.accessTokenExpiry,
    },
  );
};

export const User = model("User", userSchema);
