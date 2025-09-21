const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create a task
router.post('/', (req, res) => {
  const { title, description, deadline } = req.body;

  if (!title || !deadline) {
    return res.status(400).json({ error: 'Title and deadline are required' });
  }

  const query = 'INSERT INTO tasks (title, description, deadline) VALUES (?, ?, ?)';
  db.query(query, [title, description, deadline], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database insert error', details: err.message });
    res.status(201).json({ message: 'Task created', taskId: results.insertId });
  });
});

// Get all tasks
router.get('/', (req, res) => {
  db.query('SELECT * FROM tasks', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error', details: err.message });
    res.status(200).json(results);
  });
});

// Update a task
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, deadline, is_completed } = req.body;

  const query = 'UPDATE tasks SET title = ?, description = ?, deadline = ?, is_completed = ? WHERE id = ?';
  db.query(query, [title, description, deadline, is_completed, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database update error', details: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json({ message: 'Task updated successfully' });
  });
});

// Delete a task
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM tasks WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database delete error', details: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json({ message: 'Task deleted successfully' });
  });
});

module.exports = router;