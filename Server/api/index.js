import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// 🔥 IMPORTANT → path goes one level up from /api
import router from "../routes/route.js";

dotenv.config();

const MONGODB = process.env.MONGODB_URI;

const app = express();

console.log("Router loaded");

// ================= MIDDLEWARE =================

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://admin1step.vercel.app",
  "https://admin1step.vercel.app/api",
  "https://admin1step-4i4k6e6hm-abisheks-projects-eb26add9.vercel.app",
  "https://admin1step-git-test-abisheks-projects-eb26add9.vercel.app",
  "https://admin1step-5ov0p7213-abisheks-projects-eb26add9.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.endsWith(".vercel.app") || origin.includes("localhost")) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ================= ROUTES =================
// root test
app.get("/api", (req, res) => {
  res.send("API root working 🚀");
});

// your existing APIs
app.use("/api", router);




// ================= DATABASE =================

if (!mongoose.connections[0].readyState) {
  mongoose
    .connect(MONGODB)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((error) =>
      console.error("Error connecting to MongoDB:", error.message)
    );
}


// ================= EXPORT (VERY IMPORTANT) =================

export default app;
