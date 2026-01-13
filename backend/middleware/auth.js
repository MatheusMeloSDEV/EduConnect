
const User = require('../models/User');

// Middleware que verifica a validade do token JWT na requisição
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: "Token de acesso necessário" });

  try {
    // Formato Básico de Token Simulado: "mock-token-{userId}-{timestamp}"
    // Em produção, use JWT (pacote jsonwebtoken)
    const parts = token.split('-');
    let userId = null;
    
    // Suporte para fallback de token "offline-token" antigo
    if (token === "offline-token") {
         return res.status(401).json({ success: false, message: "Token offline inválido para backend online." });
    }
    
    if (parts.length >= 3) {
       // Extrair ID do meio da string
       userId = parts.slice(2, parts.length - 1).join('-'); 
       // Fallback para formato de id simples
       if(!userId) userId = parts[2]; 
    }

    if (!userId) {
        return res.status(401).json({ success: false, message: "Formato de token inválido" });
    }

    const user = await User.findById(userId);
    
    if (!user || !user.active) {
       return res.status(401).json({ success: false, message: "Usuário não encontrado ou inativo" });
    }

    req.user = { userId: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({ success: false, message: "Erro na autenticação" });
  }
};

// Middleware que verifica o token se presente, mas não bloqueia a requisição se ausente
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) return authenticateToken(req, res, next);
    next();
};

module.exports = { authenticateToken, optionalAuth };
