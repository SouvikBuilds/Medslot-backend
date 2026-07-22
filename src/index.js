import config from "./config/envConfig.js";
import { connectDB } from "./db/config.js";
import app from "./app.js";

await connectDB()
  .then(() => {
    app.listen(config.PORT, () => {
      console.log(`Server is running on http://localhost:${config.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting Database");
  });
