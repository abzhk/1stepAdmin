import mongoose from "mongoose";

const learningProgramRatingSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearningProgram",
      required: true,
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

learningProgramRatingSchema.index({ course: 1, parent: 1 }, { unique: true });

const LearningProgramRating =
  mongoose.models.LearningProgramRating ||
  mongoose.model("LearningProgramRating", learningProgramRatingSchema, "courseratings");

export default LearningProgramRating;
