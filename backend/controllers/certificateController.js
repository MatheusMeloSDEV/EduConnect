const Certificate = require('../models/Certificate');

// 1. Marca como concluído e gera o certificado
exports.markAsCompleted = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    // Verifica se já existe
    let certificate = await Certificate.findOne({ user: userId, article: articleId });
    
    if (certificate) {
      return res.json({ success: true, alreadyCompleted: true, certificate });
    }

    // Gera um código de autenticação único (Ex: EDU-X7B9K-1234)
    const authHash = "EDU-" + Math.random().toString(36).substring(2, 7).toUpperCase() + "-" + Date.now().toString().slice(-4);

    certificate = await Certificate.create({
      user: userId,
      article: articleId,
      authHash
    });

    res.status(201).json({ success: true, certificate });
  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    res.status(500).json({ success: false, message: "Erro ao salvar conclusão." });
  }
};

// 2. Verifica se o usuário já concluiu o artigo
exports.checkCompletion = async (req, res) => {
  try {
    const { articleId } = req.params;
    const certificate = await Certificate.findOne({ user: req.user.id, article: articleId });
    
    res.json({ success: true, completed: !!certificate, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao verificar status." });
  }
};

// 3. Busca todos os certificados do aluno (Usaremos na Aba do Perfil depois!)
exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate({
        path: 'article',
        select: 'headline imageUrl writer',
        populate: { path: 'writer', select: 'fullName' }
      })
      .sort({ createdAt: -1 }); // Mais recentes primeiro

    res.json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar certificados." });
  }
};