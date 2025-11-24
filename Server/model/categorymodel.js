import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
    //   required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
    },
    icon: {
      type: String,
      default: "📝",
    },
    color: {
      type: String,
      default: "#65467C",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    articleCount: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate slug
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

// Index for faster queries
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, order: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
