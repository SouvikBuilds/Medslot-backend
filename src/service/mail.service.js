import { transporter } from "../utils/index.js";

export async function sendMail(options) {
  try {
    const info = await transporter.sendMail(options);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
