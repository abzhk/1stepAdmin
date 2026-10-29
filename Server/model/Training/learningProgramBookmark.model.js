import mongoose from "mongoose";

const learningProgramBookmarkSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningProgram",
      required: true,
      index: true,
    },
    moduleId: {
      type: String,
      required: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    topicId: {
      type: String,
    },
    // Denormalized snapshot for lightning-fast O(1) dashboard listing without heavy joins
    lessonTitle: {
      type: String,
      required: true,
      trim: true,
    },
    moduleTitle: {
      type: String,
      default: "",
      trim: true,
    },
    courseTitle: {
      type: String,
      default: "",
      trim: true,
    },
    courseImage: {
      type: String,
      default: "",
    },
    lessonNumber: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "10 min",
    },
  },
  { timestamps: true }
);

learningProgramBookmarkSchema.index(
  { parent: 1, course: 1, lessonId: 1 },
  { unique: true }
);

learningProgramBookmarkSchema.index({ parent: 1, createdAt: -1 });

const LearningProgramBookmark =
  mongoose.models.LearningProgramBookmark ||
  mongoose.model("LearningProgramBookmark", learningProgramBookmarkSchema, "coursebookmarks");

export default LearningProgramBookmark;
