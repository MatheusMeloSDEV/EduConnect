require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
// Default to 3010 to match documentation/instructions
const PORT = process.env.PORT || 3010;
// Use Environment Variable or fallback to the provided string
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://mathmsantos:math-tech-challenge@techchallenge-backend.a8onrmr.mongodb.net/?retryWrites=true&w=majority&appName=techchallenge-backend";

// Connect to MongoDB with better error handling
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route Imports
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/reviews', reviewRoutes);

// Mock Upload Route
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

// Root Route for Deployment Verification
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "EDUConnect Backend is running successfully.",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
      articles: "/api/articles"
    }
  });
});

// Health Check
app.get('/api/health', (req, res) => res.json({ success: true, message: "API EDUConnect Backend Running" }));

// Handle 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Rota não encontrada" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ success: false, message: "Erro interno no servidor" });
});

// Prevent crash on unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit process in dev environment to keep server alive
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Listen on 0.0.0.0 to ensure Docker container exposes the port correctly
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 EDUConnect Backend running at http://localhost:${PORT}`);
});