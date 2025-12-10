import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true }, // e.g. "Introduction to Therapy"
    description: { type: String },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    assessments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assessment" }],
    order: { type: Number }, // display order
  },
  { timestamps: true }
);

export default mongoose.model("Module", moduleSchema);
