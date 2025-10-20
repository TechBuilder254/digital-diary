const express = require('express');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const router = express.Router();
const db = require('../config/db');

// Note: Registration is handled by /api/auth/register route
// This duplicate route has been removed to avoid conflicts

// Note: Login is handled by /api/auth/login route
// This duplicate route has been removed to avoid conflicts

// Get user profile
router.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT id, username, email, avatar, bio, join_date, last_updated FROM users WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json(results[0]);
  });
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, avatar, bio } = req.body;
  
  // Check if username or email already exists (excluding current user)
  if (username || email) {
    const checkQuery = 'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?';
    db.query(checkQuery, [username, email, id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error', details: err.message });
      if (results.length > 0) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      
      updateProfile();
    });
  } else {
    updateProfile();
  }
  
  function updateProfile() {
    const fields = [];
    const values = [];
    
    if (username !== undefined) {
      fields.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }
    if (avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(avatar);
    }
    if (bio !== undefined) {
      fields.push('bio = ?');
      values.push(bio);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    fields.push('last_updated = CURRENT_TIMESTAMP');
    values.push(id);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    db.query(query, values, (err, results) => {
      if (err) return res.status(500).json({ error: 'Database update error', details: err.message });
      if (results.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
      
      // Return updated user data
      db.query('SELECT id, username, email, avatar, bio, join_date, last_updated FROM users WHERE id = ?', [id], (err, userResults) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err.message });
        res.json(userResults[0]);
      });
    });
  }
});

// Change password
router.put('/profile/:id/password', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  
  // Get current password hash
  db.query('SELECT password FROM users WHERE id = ?', [id], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    
    try {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, results[0].password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      const updateQuery = 'UPDATE users SET password = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?';
      db.query(updateQuery, [hashedNewPassword, id], (err, updateResults) => {
        if (err) return res.status(500).json({ error: 'Password update failed', details: err.message });
        if (updateResults.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        
        res.json({ message: 'Password updated successfully' });
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred during password update', details: error.message });
    }
  });
});

// Get user statistics
router.get('/profile/:id/stats', (req, res) => {
  const { id } = req.params;
  
  const stats = {};
  let completedQueries = 0;
  const totalQueries = 4;
  
  // Count notes
  db.query('SELECT COUNT(*) as count FROM notes', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    stats.totalNotes = results[0].count;
    completedQueries++;
    if (completedQueries === totalQueries) res.json(stats);
  });
  
  // Count todos
  db.query('SELECT COUNT(*) as count FROM todos WHERE is_deleted = 0', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    stats.totalTodos = results[0].count;
    completedQueries++;
    if (completedQueries === totalQueries) res.json(stats);
  });
  
  // Count completed todos
  db.query('SELECT COUNT(*) as count FROM todos WHERE completed = 1 AND is_deleted = 0', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    stats.completedTodos = results[0].count;
    completedQueries++;
    if (completedQueries === totalQueries) res.json(stats);
  });
  
  // Count favorite notes
  db.query('SELECT COUNT(*) as count FROM notes WHERE is_favorite = 1', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
    stats.favoriteNotes = results[0].count;
    completedQueries++;
    if (completedQueries === totalQueries) res.json(stats);
  });
});

module.exports = router;