const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create a new to-do item
router.post('/', (req, res) => {
  const { text, completed, expiry_date } = req.body;

  // Validate input
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const query = 'INSERT INTO todos (text, completed, expiry_date) VALUES (?, ?, ?)';
  db.query(query, [text, completed || false, expiry_date || null], (err, results) => {
    if (err) {
      console.error('Database insert error:', err.message);
      return res.status(500).json({ error: 'Database insert error', details: err.message });
    }
    res.status(201).json({ message: 'To-Do item created', todoId: results.insertId });
  });
});

// Get all to-do items
router.get('/', (req, res) => {
  const query = 'SELECT * FROM todos WHERE is_deleted = 0 ORDER BY created_at DESC';
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
  const { text, completed, expiry_date, is_deleted, deleted_at } = req.body;

  // Validate input
  if (text === undefined && completed === undefined && expiry_date === undefined && is_deleted === undefined) {
    return res.status(400).json({ error: 'At least one field is required for update' });
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
  if (expiry_date !== undefined) {
    fields.push('expiry_date = ?');
    values.push(expiry_date);
  }
  if (is_deleted !== undefined) {
    fields.push('is_deleted = ?');
    values.push(is_deleted);
  }
  if (deleted_at !== undefined) {
    fields.push('deleted_at = ?');
    values.push(deleted_at);
  }

  const query = `UPDATE todos SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
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

// Soft delete a to-do item (move to trash)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'UPDATE todos SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database delete error:', err.message);
      return res.status(500).json({ error: 'Database delete error', details: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'To-Do item not found' });
    }
    res.status(200).json({ message: 'To-Do item moved to trash successfully' });
  });
});

// Permanently delete a to-do item
router.delete('/:id/permanent', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM todos WHERE id = ? AND is_deleted = 1';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database permanent delete error:', err.message);
      return res.status(500).json({ error: 'Database permanent delete error', details: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'To-Do item not found in trash' });
    }
    res.status(200).json({ message: 'To-Do item permanently deleted' });
  });
});

// Restore a to-do item from trash
router.put('/:id/restore', (req, res) => {
  const { id } = req.params;

  const query = 'UPDATE todos SET is_deleted = 0, deleted_at = NULL WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database restore error:', err.message);
      return res.status(500).json({ error: 'Database restore error', details: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'To-Do item not found in trash' });
    }
    res.status(200).json({ message: 'To-Do item restored successfully' });
  });
});

// Get deleted to-do items (trash)
router.get('/trash', (req, res) => {
  const query = 'SELECT * FROM todos WHERE is_deleted = 1 ORDER BY deleted_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Database query error', details: err.message });
    }
    res.status(200).json(results);
  });
});

module.exports = router;