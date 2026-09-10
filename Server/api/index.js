import express from "express";
// import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "../db.js"

import router from "../routes/route.js";

dotenv.config();

// const MONGODB = process.env.MONGODB_URI;

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


app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(503).json({
      success: false,
      message: "Database unavailable",
    });
  }
});

// mongoose
//   .connect(MONGODB)
//   .then(() => console.log("Connected to MongoDB successfully"))
//   .catch((error) =>
//     console.error("Error connecting to MongoDB:", error.message)
//   );


app.use("/api", router);

app.get("/api", (req, res) => {
  res.status(200).send("Backend is live");
});


app.use((req, res, next) => {
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