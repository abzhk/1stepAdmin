import mongoose from "mongoose";

const providerAssessmentResponseSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "providerAssessment",
      required: true,
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: mongoose.Schema.Types.Mixed,
        score: Number,
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["inProgress", "completed", "submitted"],
      default: "inProgress",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    timeTaken: Number,
  },
  { timestamps: true }
);

const assessmentResponse = mongoose.model(
  "providerAssessmentResponse",
  providerAssessmentResponseSchema
);
export default assessmentResponse;
