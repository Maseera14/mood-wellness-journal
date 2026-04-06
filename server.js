const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mood-wellness';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully!');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
const entriesRouter = require('./entries');
app.use('/api/entries', entriesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    message: 'Mood & Wellness Journal API is running!',
    timestamp: new Date().toISOString()
  });
});

// API Root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Mood & Wellness Journal API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      entries: '/api/entries',
      stats: {
        moods: '/api/entries/stats/moods',
        wellness: '/api/entries/stats/wellness'
      }
    }
  });
});

// Serve React Frontend (Static Build)
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api`);
});