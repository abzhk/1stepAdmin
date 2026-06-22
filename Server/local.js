import app from "./api/index.js";
import dotenv from "dotenv";
import { startEmailWatcher } from "./utils/emailService.js";

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Local server running on port ${PORT}`);
});
console.log('🚀 Starting email watcher...');
startEmailWatcher();