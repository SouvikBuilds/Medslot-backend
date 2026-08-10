import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT,
  ORIGIN: process.env.ORIGIN,
  DB_NAME: process.env.DB_NAME,
  MONGO_URI: process.env.MONGO_URI,
  accessToken: process.env.accessToken,
  doctorAccessToken: process.env.doctorAccessToken,
  magicToken: process.env.magicToken,
  accessTokenExpiry: process.env.accessTokenExpiry,
  refreshToken: process.env.refreshToken,
  regfreshTokenExpiry: process.env.regfreshTokenExpiry,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_CLOUD_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};

export default config;
