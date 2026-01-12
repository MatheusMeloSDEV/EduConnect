const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    headline: {
      type: String,
      required: [true, "Título é obrigatório"],
      trim: true,
      maxlength: [200, "Título não pode ter mais de 200 caracteres"],
    },
    summary: {
      type: String,
      required: [true, "Resumo é obrigatório"],
      trim: true,
      maxlength: [500, "Resumo não pode ter mais de 500 caracteres"],
    },
    body: {
      type: String,
      required: [true, "Conteúdo é obrigatório"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Imagem é obrigatória"],
      trim: true,
    },
    upvotes: {
      type: Number,
      default: 0,
      min: [0, "Upvotes não podem ser negativos"],
    },
    reviews: {
      type: Number,
      default: 0,
      min: [0, "Avaliações não podem ser negativas"],
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Changed from "Account" to "User" to match filename
      required: [true, "Autor é obrigatório"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isReleased: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para melhor performance
articleSchema.index({ headline: "text", body: "text" });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ upvotes: -1 });

module.exports = mongoose.model("Article", articleSchema);