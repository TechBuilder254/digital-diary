const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create a new to-do item
router.post('/', (req, res) => {
  const { text, completed } = req.body;

  // Validate input
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const query = 'INSERT INTO todos (text, completed) VALUES (?, ?)';
  db.query(query, [text, completed || false], (err, results) => {
    if (err) {
      console.error('Database insert error:', err.message);
      return res.status(500).json({ error: 'Database insert error', details: err.message });
    }
    res.status(201).json({ message: 'To-Do item created', todoId: results.insertId });
  });
});

// Get all to-do items
router.get('/', (req, res) => {
  const query = 'SELECT * FROM todos ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Database query error', details: err.message });
    }
    res.status(200).json(results);
  });
});

// Update a to-do item
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  // Validate input
  if (text === undefined && completed === undefined) {
    return res.status(400).json({ error: 'Text or completed status is required' });
  }

  // Build the query dynamically based on provided fields
  const fields = [];
  const values = [];

  if (text !== undefined) {
    fields.push('text = ?');
    values.push(text);
  }
  if (completed !== undefined) {
    fields.push('completed = ?');
    values.push(completed);
  }

  const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Database update error:', err.message);
      return res.status(500).json({ error: 'Database update error', details: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'To-Do item not found' });
    }
    res.status(200).json({ message: 'To-Do item updated successfully' });
  });
});

// Delete a to-do item
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM todos WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database delete error:', err.message);
      return res.status(500).json({ error: 'Database delete error', details: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'To-Do item not found' });
    }
    res.status(200).json({ message: 'To-Do item deleted successfully' });
  });
});

module.exports = router;