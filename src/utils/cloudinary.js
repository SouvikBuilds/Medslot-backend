import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import config from "../config/envConfig.js";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("File path is missing.");
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Error while uploading file.", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("🗑️ Local temp file deleted after error");
    }
    return null;
  }
};

export const deleteFromCloudinary = async (url) => {
  try {
    if (!url) {
      console.log("Url is missing.");
      return null;
    }
    const parts = url.split("/");
    const publicId = parts[parts.length - 1].split(".")[0];
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.log("Error while deleting file.", error);
    return null;
  }
};
