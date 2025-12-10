import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    modules: [
      {
        module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
        completed: { type: Boolean, default: false },
        lessons: [
          {
            lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
            completed: { type: Boolean, default: false },
            topics: [
              {
                topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
                completed: { type: Boolean, default: false },
              },
            ],
          },
        ],
        assessment: {
          attempted: { type: Boolean, default: false },
          score: { type: Number },
          passed: { type: Boolean, default: false },
          feedback: { type: String },
        },
      },
    ],

    certification: {
      certified: { type: Boolean, default: false },
      certifiedOn: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Progress", progressSchema);
