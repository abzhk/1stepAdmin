import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subTitle: { type: String, required: true },
    description: { type: String, required: true, minlength: 200 },
    createdByType: {
      type: String,
      enum: ["provider", "1Step"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByType",
      required: true,
    },
    basicInfo: [
      {
        language: { type: String, default: "English (US)" },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          required: true,
        },
        category: { type: String, required: true },
        subCategory: { type: String },
      },
    ],
    courseImage: { type: String, required: true },
    promoVideoUrl: { type: String },
    goals: [{ type: String }],
    requirements: [{ type: String }],
    targetAudience: [{ type: String }],
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    isPublished: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },
    price: { type: Number, default: 0 },

    rating: { type: Number, default: 0 },
    totalEnrollments: { type: Number, default: 0 },

    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
