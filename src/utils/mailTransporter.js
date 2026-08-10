import config from "../config/envConfig.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("Mail transporter error:", error.message);
  } else {
    console.log("Mail transporter is ready");
  }
});

export default transporter;
