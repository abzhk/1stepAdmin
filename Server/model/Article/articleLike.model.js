import mongoose from "mongoose";

const articleLikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Avoid duplicate likes by the same user on the same article
articleLikeSchema.index({ user: 1, article: 1 }, { unique: true });

const ArticleLike = mongoose.model("ArticleLike", articleLikeSchema);

export default ArticleLike;
