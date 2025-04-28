const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create a new mood entry
router.post('/', (req, res) => {
  const { mood, date } = req.body;

  // Validate input
  if (!mood || !date) {
    return res.status(400).json({ error: 'Mood and date are required' });
  }

  const query = 'INSERT INTO moods (mood, date) VALUES (?, ?)';
  db.query(query, [mood, date], (err, results) => {
    if (err) {
      console.error('Database insert error:', err.message);
      return res.status(500).json({ error: 'Database insert error', details: err.message });
    }
    res.status(201).json({ id: results.insertId, mood, date });
  });
});

// Get all mood entries
router.get('/', (req, res) => {
  const query = 'SELECT * FROM moods ORDER BY date DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Database query error', details: err.message });
    }
    res.status(200).json(results);
  });
});

module.exports = router;