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

// Delete a mood entry
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Validate input
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Valid mood ID is required' });
  }

  const query = 'DELETE FROM moods WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database delete error:', err.message);
      return res.status(500).json({ error: 'Database delete error', details: err.message });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }
    
    res.status(200).json({ message: 'Mood entry deleted successfully' });
  });
});

module.exports = router;