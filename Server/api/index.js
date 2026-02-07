import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// 🔥 path from /Server/api → /Server/routes
import router from "../routes/route.js";

dotenv.config();

const app = express();

console.log("✅ API function started");


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cookieParser());

// ---------- CORS ----------
app.use(
  cors({
    origin: (origin, callback) => {
      // allow localhost + any vercel deployment
      if (!origin || origin.includes("localhost") || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// ---------- VERY IMPORTANT ----------
// without this, browser preflight may return 404
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return res.status(200).end();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ======================================================
// ROUTES
// ======================================================

// health endpoint
app.get("/api", (req, res) => {
  res.status(200).send("API root working 🚀");
});

// real application routes
app.use("/api", router);


// ======================================================
// DATABASE (reuse connection in serverless)
// ======================================================

const MONGODB = process.env.MONGODB_URI;

if (!mongoose.connections[0].readyState) {
  mongoose
    .connect(MONGODB)
    .then(() => console.log("✅ Mongo connected"))
    .catch((err) => console.error("❌ Mongo error:", err.message));
}


// ======================================================
// GLOBAL ERROR HANDLER (prevents fake CORS)
// ======================================================

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({ success: false, message: err.message });
});


// ======================================================
// EXPORT
// ======================================================

export default app;
