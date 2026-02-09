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
  "https://admin1step-git-test-abisheks-projects-eb26add9.vercel.app",
  "https://admin1step-6hg40tlki-abisheks-projects-eb26add9.vercel.app",
  "https://admin1step-7bwijxs61-abisheks-projects-eb26add9.vercel.app",
  "https://admin1step-f7r1mx10p-abisheks-projects-eb26add9.vercel.app",
];
 
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // localhost
      if (
        origin.startsWith("http://localhost")
      ) {
        return callback(null, true);
      }

      // allow all vercel domains
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
if (!mongoose.connections[0].readyState) {
  mongoose
    .connect(MONGODB)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((error) =>
      console.error("Error connecting to MongoDB:", error. Message)
    );
}
 
 
app.use("/api", router);
app.get("/api", (req, res) => {
  res.status(200).send("Backend is live ");
});
app.use((req, res, next) => {
  console.log("PATH RECEIVED:", req.originalUrl);
  next();
});
 
 
 
export default app;