const Certificate = require('../models/Certificate');

// 1. Marca como concluído e gera o certificado
exports.markAsCompleted = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    // Suporte para os dois formatos de ID comuns no JWT
    const userId = req.user.id || req.user._id; 

    if (!userId) {
        return res.status(401).json({ success: false, message: "Usuário não autenticado." });
    }

    let certificate = await Certificate.findOne({ user: userId, article: articleId });
    
    if (certificate) {
      // ✅ ADICIONADO O "data" AQUI
      return res.json({ success: true, alreadyCompleted: true, data: { certificate } });
    }

    const authHash = "EDU-" + Math.random().toString(36).substring(2, 7).toUpperCase() + "-" + Date.now().toString().slice(-4);

    certificate = await Certificate.create({
      user: userId,
      article: articleId,
      authHash
    });

    // ✅ ADICIONADO O "data" AQUI
    res.status(201).json({ success: true, data: { certificate } });
  } catch (error) {
    console.error("❌ Erro interno no markAsCompleted:", error);
    res.status(500).json({ success: false, message: "Erro ao salvar conclusão." });
  }
};

// 2. Verifica se o usuário já concluiu o artigo
exports.checkCompletion = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id || req.user._id;

    const certificate = await Certificate.findOne({ user: userId, article: articleId });
    
    // ✅ ADICIONADO O "data" AQUI
    res.json({ success: true, data: { completed: !!certificate, certificate } });
  } catch (error) {
    console.error("❌ Erro interno no checkCompletion:", error);
    res.status(500).json({ success: false, message: "Erro ao verificar status." });
  }
};

// 3. Busca todos os certificados do aluno
exports.getMyCertificates = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const certificates = await Certificate.find({ user: userId })
      .populate({
        path: 'article',
        select: 'headline imageUrl writer',
        populate: { path: 'writer', select: 'fullName' }
      })
      .sort({ createdAt: -1 });

    // Aqui já estava com o "data" certo!
    res.json({ success: true, data: certificates });
  } catch (error) {
    console.error("❌ Erro interno no getMyCertificates:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar certificados." });
  }
};