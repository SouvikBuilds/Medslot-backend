import config from "./config/envConfig.js";
import { connectDB } from "./db/config.js";
import app from "./app.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(path.join(__dirname, "../public/temp"), { recursive: true });

await connectDB()
  .then(() => {
    app.listen(config.PORT, () => {
      console.log(`Server is running on http://localhost:${config.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting Database");
  });
