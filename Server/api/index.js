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


// ================= MIDDLEWARE =================

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://admin1step.vercel.app",
  "https://admin1step.vercel.app/api",
  "https://admin1step-4i4k6e6hm-abisheks-projects-eb26add9.vercel.app",
  "https://admin1step-git-test-abisheks-projects-eb26add9.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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
