import config from "../config/envConfig.js";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${config.MONGO_URI}/${config.DB_NAME}`,
    );
    console.log(
      `MongoDB connected successfully. DB HOST: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("Error while connecting database.");
  }
};
