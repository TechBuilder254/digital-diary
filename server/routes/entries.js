const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create an entry
router.post('/', (req, res) => {
  const { title, content, user_id } = req.body;

  // Validate input
  if (!title || !content || !user_id) {
    console.error('Missing data: title, content, or user_id');
    return res.status(400).json({ error: 'Title, content, and user_id are required' });
  }

  const query = 'INSERT INTO entries (title, content, user_id) VALUES (?, ?, ?)';
  db.query(query, [title, content, user_id], (err, results) => {
    if (err) {
      console.error('Database insert error:', err.message);
      return res.status(500).json({ error: 'Database insert error', details: err.message });
    }

    const newEntry = {
      id: results.insertId, // Get the inserted entry's ID
      title,
      content,
      user_id,
    };

    console.log('Entry created with ID:', results.insertId); // Log the newly created entry ID
    res.status(201).json(newEntry); // Return the full entry object
  });
});

// Get all entries
router.get('/', (req, res) => {
  const query = 'SELECT * FROM entries ORDER BY id DESC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: 'Database query error', details: err.message });
    }

    console.log('Entries fetched:', results); // Log the fetched entries for debugging

    if (results.length === 0) {
      return res.status(200).json({ message: 'No entries found' });
    }

    res.status(200).json(results);
  });
});

// Delete an entry
router.delete('/:id', (req, res) => {
  const entryId = req.params.id;

  // Validate that the ID is provided
  if (!entryId) {
    return res.status(400).json({ error: 'Entry ID is required' });
  }

  const query = 'DELETE FROM entries WHERE id = ?';
  db.query(query, [entryId], (err, results) => {
    if (err) {
      console.error('Database delete error:', err.message);
      return res.status(500).json({ error: 'Database delete error', details: err.message });
    }

    if (results.affectedRows === 0) {
      console.log(`No entry found with ID: ${entryId}`); // Log if no entry was found to delete
      return res.status(404).json({ error: 'Entry not found' });
    }

    console.log(`Entry with ID: ${entryId} deleted successfully`); // Log successful deletion
    res.status(200).json({ message: 'Entry deleted successfully' });
  });
});

// Update an entry
router.put('/:id', (req, res) => {
  const entryId = req.params.id;
  const { title, content } = req.body;

  // Validate input
  if (!title || !content) {
    console.error('Missing data: title or content');
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const query = 'UPDATE entries SET title = ?, content = ? WHERE id = ?';
  db.query(query, [title, content, entryId], (err, results) => {
    if (err) {
      console.error('Database update error:', err.message);
      return res.status(500).json({ error: 'Database update error', details: err.message });
    }

    if (results.affectedRows === 0) {
      console.log(`No entry found with ID: ${entryId}`); // Log if no entry found to update
      return res.status(404).json({ error: 'Entry not found' });
    }

    const updatedEntry = {
      id: entryId,
      title,
      content,
    };

    console.log(`Entry with ID: ${entryId} updated successfully`); // Log successful update
    res.status(200).json(updatedEntry); // Return the updated entry object
  });
});

module.exports = router;