import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    featuredImage: {
      type: String,
      required: true,
    },
    category: { type: String, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    providerName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 5,
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Text search index
articleSchema.index(
  {
    title: "text",
    content: "text",
    excerpt: "text",
    tags: "text",
  },
  {
    name: "article_search_index",
    weights: {
      title: 10,
      excerpt: 5,
      tags: 3,
      content: 1,
    },
  }
);

// Filter indexes
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ providerId: 1, status: 1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ slug: 1 });

articleSchema.pre("validate", async function (next) {
  if (!this.title) return next();

  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const regex = new RegExp(`^${baseSlug}(-\\d+)?$`);

  const existing = await mongoose.models.Article.find({ slug: regex }).select(
    "slug"
  );

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

const Article = mongoose.model("Article", articleSchema);
export default Article;
