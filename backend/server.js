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

// Connect to MongoDB
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

// Health Check
app.get('/api/health', (req, res) => res.json({ success: true, message: "API EDUConnect Backend Running" }));

app.listen(PORT, () => {
  console.log(`\n🚀 EDUConnect Backend running at http://localhost:${PORT}`);
});