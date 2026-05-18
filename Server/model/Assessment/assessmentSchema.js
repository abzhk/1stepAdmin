import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assessmentCategory",
      required: true,
    },

    version: {
      type: Number,
      default: 1,
    },

    scoringType: {
      type: String,
      enum: ["sum", "weighted", "formula"],
      default: "sum",
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },
    AssessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assessment",
      default: null,
    },
        isLatestVersion: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
  },
  { timestamps: true }
);

export default mongoose.model("assessment", assessmentSchema);