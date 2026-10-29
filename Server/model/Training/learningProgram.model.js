import mongoose from "mongoose";

const learningProgramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subTitle: { type: String, required: true },
    description: { type: String, required: true },

    basicInfo: [
      {
        language: { type: String, default: "English" },
        level: { type: String, default: "Beginner" },
        category: { type: String, default: "Parent Training" },
        subCategory: { type: String, default: "" },
      },
    ],

    courseImage: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80",
    },

    promoVideoUrl: {
      type: String,
      default: "",
    },

    goals: [{ type: String }],
    requirements: [{ type: String }],
    targetAudience: [{ type: String }],

    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },

    isPublished: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
      index: true,
    },

    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],

    reviewSummary: {
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      ratingDistribution: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 },
      },
      recentReviews: [
        {
          parent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          rating: { type: Number, min: 1, max: 5 },
          review: { type: String, default: "" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      lastUpdated: { type: Date, default: Date.now },
    },

    tags: [{ type: String }],
  },
  { timestamps: true }
);

const LearningProgram =
  mongoose.models.LearningProgram ||
  mongoose.model("LearningProgram", learningProgramSchema, "courses");

export default LearningProgram;
