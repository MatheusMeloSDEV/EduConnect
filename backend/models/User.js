const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Nome completo é obrigatório"],
      trim: true,
      maxlength: [100, "Nome não pode ter mais de 100 caracteres"],
    },
    email: {
      type: String,
      required: [true, "Email é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Email deve ter um formato válido",
      ],
    },
    password: {
      type: String,
      required: [true, "Senha é obrigatório"],
      minlength: [6, "Senha deve ter pelo menos 6 caracteres"],
      select: true, // Changed to true briefly to allow selection in controller if needed, but usually handled by select('+password')
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
    institution: {
      type: String,
      required: [true, "Escola é obrigatória"],
      trim: true,
      maxlength: [100, "Nome da escola não pode ter mais de 100 caracteres"],
    },
    age: {
      type: Number,
      required: [true, "Idade é obrigatória"],
      min: [5, "Idade deve ser pelo menos 5 anos"],
      max: [100, "Idade deve ser no máximo 100 anos"],
    },
    role: {
      type: String,
      required: [true, "Tipo de usuário é obrigatório"],
      enum: {
        values: ["professor", "aluno"],
        message: "Tipo de usuário deve ser 'professor' ou 'aluno'",
      },
    },
    // Campos específicos para Aluno
    guardianName: {
      type: String,
      required: function () {
        return this.role === "aluno";
      },
      trim: true,
      maxlength: [
        100,
        "Nome do responsável não pode ter mais de 100 caracteres",
      ],
    },
    group: {
      type: String,
      required: function () {
        return this.role === "aluno";
      },
      trim: true,
      maxlength: [20, "Turma não pode ter mais de 20 caracteres"],
    },
    // Campos específicos para Professor
    subjects: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Matéria não pode ter mais de 50 caracteres"],
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    lastAccess: {
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
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ institution: 1 });
userSchema.index({ fullName: "text" });

// Middleware para hash da senha antes de salvar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware para hash da senha antes de atualizar
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      update.password = await bcrypt.hash(update.password, salt);
    } catch (error) {
      next(error);
    }
  }

  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para retornar dados públicos do usuário
userSchema.methods.toPublicJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Método estático para buscar por email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual para nome completo (compatibilidade)
userSchema.virtual("name").get(function () {
  return this.fullName;
});

// Virtual para idade em anos (compatibilidade)
userSchema.virtual("ageInYears").get(function () {
  return this.age;
});

module.exports = mongoose.model("User", userSchema);