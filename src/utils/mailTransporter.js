import config from "../config/envConfig.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export default transporter;
