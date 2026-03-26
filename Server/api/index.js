import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import router from "../routes/route.js";

dotenv.config();

const MONGODB = process.env.MONGODB_URI;

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://admin1step.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin); 
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose
  .connect(MONGODB)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((error) =>
    console.error("Error connecting to MongoDB:", error.message)
  );


app.use("/api", router);

app.get("/api", (req, res) => {
  res.status(200).send("Backend is live");
});


app.use((req, res, next) => {
  // console.log("PATH RECEIVED:", req.originalUrl);
  next();
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
  });
});

export default app;