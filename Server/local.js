import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./api/index.js");
const { startEmailWatcher } = await import("./utils/emailService.js");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Local server running on port ${PORT}`);
});

console.log("🚀 Starting email watcher...");
startEmailWatcher();