import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/envConfig.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: config.ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.static("public"));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

import userRouter from "./routes/user.route.js";
import doctorRouter from "./routes/doctor.route.js";
import mesageRouter from "./routes/message.route.js";
import adminRouter from "./routes/admin.route.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/messages", mesageRouter);
app.use("/api/v1/admin", adminRouter);

export default app;
