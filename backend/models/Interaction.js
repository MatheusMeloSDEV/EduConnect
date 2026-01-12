const mongoose = require("mongoose");

// --- ReviewLike Schema ---
const reviewLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice único para evitar likes duplicados
reviewLikeSchema.index({ user: 1, review: 1 }, { unique: true });

// --- Upvote Schema (ArticleUpvote) ---
const upvoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Usuário é obrigatório"],
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: [true, "Artigo é obrigatório"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índice único: só um upvote por usuário por artigo
upvoteSchema.index({ user: 1, article: 1 }, { unique: true });
upvoteSchema.index({ article: 1 });
upvoteSchema.index({ user: 1 });
upvoteSchema.index({ createdAt: -1 });

// Check if models already exist to prevent "OverwriteModelError"
const ReviewLike = mongoose.models.ReviewLike || mongoose.model("ReviewLike", reviewLikeSchema);
const ArticleUpvote = mongoose.models.Upvote || mongoose.model("Upvote", upvoteSchema);

module.exports = {
    ReviewLike,
    ArticleUpvote
};