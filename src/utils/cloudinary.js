import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import config from "../config/envConfig.js";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

try {
  await cloudinary.api.ping();
} catch (err) {
  // cloudinary unreachable on startup
}

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "medslot",
      resource_type: "image",
    });

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return null;
    const parts = url.split("/");
    const publicId = parts[parts.length - 1].split(".")[0];
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    return null;
  }
};
