import mongoose from "mongoose";
import Help from "./model/Help/help.model.js";
import User from "./model/user.model.js";
import Parent from "./model/parent.model.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const tickets = await Help.find({ subcategory: "Email Change Request" })
      .populate("user", "username email profilePicture")
      .sort({ createdAt: -1 })
      .lean();
      
  console.log("tickets users:", tickets.map(t => t.user));
  process.exit(0);
}
test();
