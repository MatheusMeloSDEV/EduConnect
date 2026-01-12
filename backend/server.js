
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
// Padrão para 3010 para corresponder à documentação/instruções
const PORT = process.env.PORT || 3010;
// Usa Variável de Ambiente ou fallback para a string fornecida
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mathmsantos:math-tech-challenge@techchallenge-backend.a8onrmr.mongodb.net/?retryWrites=true&w=majority&appName=techchallenge-backend";

// Conectar ao MongoDB com melhor tratamento de erro
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch(err => console.error('❌ Erro na Conexão MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Importações de Rotas
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/reviews', reviewRoutes);

// Rota de Upload Simulado
app.post('/api/upload/image', (req, res) => {
    res.json({
        success: true,
        message: "Upload (simulado) realizado",
        data: {
            url: "https://picsum.photos/seed/" + Date.now() + "/800/600",
            filename: "mock-image.jpg"
        }
    });
});

// Rota Raiz para Verificação de Deploy
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "EDUConnect Backend rodando com sucesso.",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
      articles: "/api/articles"
    }
  });
});

// Verificação de Saúde
app.get('/api/health', (req, res) => res.json({ success: true, message: "API EDUConnect Backend Rodando" }));

// Lidar com 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Rota não encontrada" });
});

// Manipulador de Erro Global
app.use((err, req, res, next) => {
    console.error("Erro Não Tratado:", err);
    res.status(500).json({ success: false, message: "Erro interno no servidor" });
});

// Prevenir crash em rejeição não tratada
process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejeição Não Tratada em:', promise, 'motivo:', reason);
    // Não sair do processo em ambiente dev para manter o servidor ativo
});

process.on('uncaughtException', (error) => {
    console.error('Exceção Não Capturada:', error);
});

// Escutar em 0.0.0.0 para garantir que o container Docker exponha a porta corretamente
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 EDUConnect Backend rodando em http://localhost:${PORT}`);
});
