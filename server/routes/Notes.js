const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the database connection

// Create a new note
router.post('/', (req, res) => {
    const { title, content } = req.body;
  
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
  
    const query = 'INSERT INTO notes (title, content) VALUES (?, ?)';
    db.query(query, [title, content], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database insert error', details: err.message });
  
      const newNote = {
        id: results.insertId, // Get the inserted note's ID
        title,
        content,
      };
  
      res.status(201).json(newNote); // Return the full note object
    });
  });
// Get all notes
router.get('/', (req, res) => {
  db.query('SELECT * FROM notes', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error', details: err.message });
    res.status(200).json(results);
  });
});

// Update a note
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const query = 'UPDATE notes SET title = ?, content = ? WHERE id = ?';
  db.query(query, [title, content, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database update error', details: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Note not found' });
    res.status(200).json({ message: 'Note updated successfully' });
  });
});

// Delete a note
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM notes WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database delete error', details: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Note not found' });
    res.status(200).json({ message: 'Note deleted successfully' });
  });
});

module.exports = router;