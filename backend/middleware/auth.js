const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: "Token de acesso necessário" });

  try {
    // Basic Mock Token Format: "mock-token-{userId}-{timestamp}"
    // In production, use JWT (jsonwebtoken package)
    const parts = token.split('-');
    let userId = null;
    
    // Support legacy "offline-token" fallback
    if (token === "offline-token") {
         return res.status(401).json({ success: false, message: "Token offline inválido para backend online." });
    }
    
    if (parts.length >= 3) {
       // Extract ID from middle of string
       userId = parts.slice(2, parts.length - 1).join('-'); 
       // Fallback for simple id format
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

const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) return authenticateToken(req, res, next);
    next();
};

module.exports = { authenticateToken, optionalAuth };