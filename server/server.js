const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entries');
const taskRoutes = require('./routes/tasks');
const todoRoutes = require('./routes/todo'); // Import the To-Do List routes
const moodRoutes = require('./routes/moods'); // Import the Mood Tracker routes
const notesRoutes = require('./routes/Notes'); // Import the Notes routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection check
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to the database successfully.');
  }
});

// Root API check
app.get('/', (req, res) => {
  res.send('Digital Diary API is working!');
});

// Routes
app.use('/api/auth', authRoutes); // Auth routes
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