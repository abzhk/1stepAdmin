import mongoose from "mongoose";

const providerAssessmentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assessmentCategory",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        questionType: {
          type: String,
          enum: [
            "multipleChoice",
            "yesNo",
            "rating",
            "text",
            "multiSelect",
            "singleChoice",
          ],
          required: true,
        },
        options: [
          {
            text: String,
            value: String,
          },
        ],
        scale: {
          type: Number,
          default: 5,
        },
        required: {
          type: Boolean,
          default: true,
        },
        order: Number,
      },
    ],
    duration: {
      type: Number,
      default: 10,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    scoringRules: {
      type: Object,
      default: {},
    },
    instructions: {
      type: String,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    responses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "assessmentResponse",
      },
    ],
  },
  { timestamps: true }
);

providerAssessmentSchema.index({ slug: 1 }, { unique: true });
providerAssessmentSchema.index({ provider: 1, status: 1 });
providerAssessmentSchema.index({ status: 1, category: 1 });

providerAssessmentSchema.pre("validate", async function (next) {
  if (!this.title) return next();

  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const regex = new RegExp(`^${baseSlug}(-\\d+)?$`);

  const existing = await mongoose.models.providerAssessment
    .find({ slug: regex })
    .select("slug");

  if (existing.length === 0) {
    this.slug = baseSlug;
    return next();
  }

  // Extract slug numbers
  const numbers = existing
    .map((doc) => {
      const match = doc.slug.match(/-(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    })
    .sort((a, b) => b - a);

  const nextNumber = numbers[0] + 1;

  this.slug = `${baseSlug}-${nextNumber}`;

  next();
});

const providerAssessment = mongoose.model(
  "providerAssessment",
  providerAssessmentSchema
);
export default providerAssessment;
