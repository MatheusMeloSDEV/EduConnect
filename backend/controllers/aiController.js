const { GoogleGenAI } = require("@google/genai");
const Review = require('../models/Review');

// Inicializa o SDK da IA
// Dica: Se no seu .env a variável se chama GEMINI_API_KEY, ajuste aqui
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

exports.generateSuggestions = async (req, res) => {
  try {
    const { headline, body } = req.body;
    
    // VALIDAÇÃO: Evita crash se o frontend esquecer de mandar o título ou corpo
    if (!headline || typeof body !== 'string') {
        return res.status(400).json({ success: false, message: "Título e conteúdo do artigo são obrigatórios." });
    }
    
    // Agora é 100% seguro usar o substring
    const safeBody = body.substring(0, 500);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Com base no título "${headline}" e no conteúdo "${safeBody}", sugira 3 links de fontes confiáveis (BBC, G1, Khan Academy) e 2 questões de vestibular/ENEM relacionadas para complementar este material pedagógico. Retorne em formato amigável para professores.`,
    });

    res.json({ success: true, data: response.text });
  } catch (error) {
    console.error("❌ Erro na IA (Suggestions):", error);
    res.status(500).json({ success: false, message: "Erro ao gerar sugestões com a IA." });
  }
};

exports.analyzeDoubts = async (req, res) => {
  try {
    const { articleId } = req.body;

    // VALIDAÇÃO: Garantir que o ID foi enviado
    if (!articleId) {
        return res.status(400).json({ success: false, message: "ID do artigo é obrigatório." });
    }

    const comments = await Review.find({ article: articleId });
    
    // Verificar se a array existe e tem itens
    if (!comments || comments.length === 0) {
      return res.json({ success: true, data: "Ainda não há comentários suficientes neste artigo para analisar." });
    }

    const commentText = comments.map(c => c.message).join(" | ");
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise estes comentários de alunos sobre uma aula: "${commentText}". Identifique as 3 principais dúvidas comuns e sugira ao professor como explicá-las melhor na próxima aula.`,
    });

    res.json({ success: true, data: response.text });
  } catch (error) {
    console.error("❌ Erro na IA (Analyze):", error);
    res.status(500).json({ success: false, message: "Erro ao analisar dúvidas com a IA." });
  }
};