import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    type: {
      type: String,
      enum: ["reading", "video", "exercise", "role-play"],
      default: "reading",
    },
    content: { type: String },
    order: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Topic", topicSchema);
