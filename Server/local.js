import app from "./api/[...all].js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Local server running on port ${PORT}`);
});
