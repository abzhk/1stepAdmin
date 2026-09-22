import mongoose from "mongoose";
import Help from "./model/Help/help.model.js";
import User from "./model/user.model.js";
import Parent from "./model/parent.model.js";
import Provider from "./model/provider.model.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const tickets = await Help.find({ subcategory: "Email Change Request" })
      .populate("user", "username email profilePicture")
      .sort({ createdAt: -1 })
      .lean();

  const ticketUserIds = tickets.map((ticket) => ticket.user?._id).filter(Boolean);
  
  console.log("ticketUserIds:", ticketUserIds);

  const [parents, providers] = await Promise.all([
    Parent.find({ userRef: { $in: ticketUserIds } }).lean(),
    Provider.find({ userRef: { $in: ticketUserIds } }).lean(),
  ]);

  console.log("Parents found:", parents.map(p => ({ userRef: p.userRef, name: p.parentDetails?.fullName })));
  console.log("Providers found:", providers.map(p => ({ userRef: p.userRef, name: p.fullName })));
  
  process.exit(0);
}
test();
