const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "Mensagem da avaliação é obrigatória"],
      trim: true,
      maxlength: [1000, "Avaliação não pode ter mais de 1000 caracteres"],
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Changed from Account to User
      required: [true, "Avaliador é obrigatório"],
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: [true, "Artigo é obrigatório"],
    },
    parentReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null, // Para avaliações de resposta
    },
    upvotes: {
      type: Number,
      default: 0,
      min: [0, "Upvotes não podem ser negativos"],
    },
    isModified: {
      type: Boolean,
      default: false,
    },
    modifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para melhor performance
reviewSchema.index({ article: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ parentReview: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual para contar respostas
reviewSchema.virtual("responses", {
  ref: "Review",
  localField: "_id",
  foreignField: "parentReview",
  count: true,
});

// Middleware para atualizar contador de avaliações no artigo
reviewSchema.post("save", async function () {
  const Article = mongoose.model("Article");
  const article = await Article.findById(this.article);
  if (article) {
    article.reviews = await mongoose.model("Review").countDocuments({
      article: this.article,
    });
    await article.save();
  }
});

// Middleware para atualizar contador quando avaliação é deletada
reviewSchema.post("findOneAndDelete", async function () {
  const Article = mongoose.model("Article");
  const article = await Article.findById(this.article);
  if (article) {
    article.reviews = await mongoose.model("Review").countDocuments({
      article: this.article,
    });
    await article.save();
  }
});

module.exports = mongoose.model("Review", reviewSchema);