import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// 🔥 IMPORTANT → path goes one level up from /api
import router from "../routes/route.js";

dotenv.config();

const MONGODB = process.env.MONGODB_URI;

const app = express();


// ======================================================
// ✅ FORCE CORS — SERVERLESS + PREVIEW SAFE
// ======================================================
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (
    !origin ||
    origin.includes("localhost") ||
    origin.endsWith(".vercel.app")
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Immediately answer preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});


// ======================================================
// MIDDLEWARE
// ======================================================
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ======================================================
// ROUTES
// ======================================================

// health check
app.get("/api", (req, res) => {
  res.send("API root working 🚀");
});

// your actual APIs
app.use("/api", router);


// ======================================================
// DATABASE
// ======================================================
if (!mongoose.connections[0].readyState) {
  mongoose
    .connect(MONGODB)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((error) =>
      console.error("Error connecting to MongoDB:", error.message)
    );
}


// ======================================================
// EXPORT (VERY IMPORTANT)
// ======================================================
export default app;
