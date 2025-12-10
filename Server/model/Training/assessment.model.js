import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["quiz", "assignment", "simulation"],
      default: "quiz",
    },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: String, // for quiz
      },
    ],
    passingScore: { type: Number, default: 60 }, // %
  },
  { timestamps: true }
);

export default mongoose.model("Assessment", assessmentSchema);
