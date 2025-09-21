const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user'); // Import the User routes
const entryRoutes = require('./routes/entries');
const taskRoutes = require('./routes/tasks');
const todoRoutes = require('./routes/todo'); // Import the To-Do List routes
const moodRoutes = require('./routes/moods'); // Import the Mood Tracker routes
const notesRoutes = require('./routes/Notes'); // Import the Notes routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists on startup
const uploadsDir = path.resolve(__dirname, 'uploads');
const audioDir = path.resolve(__dirname, 'uploads', 'audio');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    console.log('Created uploads directory:', uploadsDir);
  }
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true, mode: 0o755 });
    console.log('Created audio directory:', audioDir);
  }
} catch (error) {
  console.error('Error creating upload directories:', error);
}

// Serve static files from uploads directory with proper path resolution
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Database connection is handled in db.js

// Root API check
app.get('/', (req, res) => {
  res.send('Digital Diary API is working!');
});

// Routes
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/users', userRoutes); // User routes
app.use('/api/entries', entryRoutes); // Entry routes
app.use('/api/tasks', taskRoutes); // Task routes
app.use('/api/todo', todoRoutes); // To-Do List routes
app.use('/api/moods', moodRoutes);
app.use('/api/notes', notesRoutes); // Notes routes

// 404 Error handling for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('An error occurred:', err.message);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});