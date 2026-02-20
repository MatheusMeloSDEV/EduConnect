const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
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
    authHash: {
      type: String,
      required: true,
      unique: true,
    }
  },
  {
    timestamps: true, // Salva automaticamente a data de criação (createdAt)
    versionKey: false,
  }
);

// Índice único: Um usuário só pode ter UM certificado por artigo
certificateSchema.index({ user: 1, article: 1 }, { unique: true });

module.exports = mongoose.model("certificate", certificateSchema);