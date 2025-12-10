import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
    order: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);
