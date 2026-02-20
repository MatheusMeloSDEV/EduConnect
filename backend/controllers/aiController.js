const { GoogleGenAI } = require("@google/genai");
const Review = require('../models/Review');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

exports.generateSuggestions = async (req, res) => {
  try {
    const { headline, body } = req.body;
    
    if (!headline || typeof body !== 'string') {
        return res.status(400).json({ success: false, message: "Título e conteúdo do artigo são obrigatórios." });
    }
    
    const safeBody = body.substring(0, 500);

const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Com base no título "${headline}" e no conteúdo "${safeBody}", atue como um assistente pedagógico e gere o seguinte material:
1. Resumo: Um parágrafo curto e engajador (máximo de 3 linhas) resumindo o texto.
2. Conteúdo Extra: Escreva 2 parágrafos aprofundando o tema. Simule o estilo de grandes portais educacionais ou de notícias. Diga explicitamente o nome da fonte que você usou como inspiração (Ex: "Conteúdo inspirado no estilo da Khan Academy/BBC").
3. Questões: 2 questões de vestibular/ENEM relacionadas ao assunto, incluindo o gabarito.

REGRA ESTRITA: Retorne APENAS o conteúdo solicitado, separado por títulos claros. NÃO invente links ou URLs de internet. Não use formatação markdown, não use asteriscos e evite completamente o uso de negrito. Responda em texto puro.`,
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

    if (!articleId) {
        return res.status(400).json({ success: false, message: "ID do artigo é obrigatório." });
    }

    const comments = await Review.find({ article: articleId });
    
    if (!comments || comments.length === 0) {
      return res.json({ success: true, data: "Ainda não há comentários suficientes neste artigo para analisar." });
    }

    const commentText = comments.map(c => c.message).join(" | ");
    
    // ✅ PROMPT CORRIGIDO PARA A FUNÇÃO CERTA
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise estes comentários de alunos sobre uma aula: "${commentText}". Identifique as 3 principais dúvidas comuns e sugira ao professor como explicá-las melhor na próxima aula.
      
REGRA ESTRITA: Retorne APENAS a análise solicitada. Não inclua NENHUMA saudação, introdução ou conclusão. Vá direto ao ponto. NÃO USE formatação markdown, não use asteriscos e evite completamente o uso de negrito (**). Responda em texto puro.`,
    });

    res.json({ success: true, data: response.text });
  } catch (error) {
    console.error("❌ Erro na IA (Analyze):", error);
    res.status(500).json({ success: false, message: "Erro ao analisar dúvidas com a IA." });
  }
};