const express = require('express');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const router = express.Router();
const db = require('../config/db');

// Register route
router.post('/register', async (req, res) => {
  console.log('Registration attempt:', req.body);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log('Missing fields:', { username: !!username, email: !!email, password: !!password });
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the username or email already exists
    const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(checkQuery, [username, email], async (err, results) => {
      if (err) {
        console.error('Database check error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      
      if (results.length > 0) {
        console.log('User already exists');
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      try {
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');

        const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ message: 'Registration failed', error: err.message });
          }
          console.log('User registered successfully:', result);
          res.json({ message: 'Registration successful!', success: true });
        });
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        return res.status(500).json({ message: 'Password hashing failed', error: hashError.message });
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An error occurred during registration', error: error.message });
  }
});

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Both username and password are required' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const user = results[0];

    try {
      // Compare the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        res.json({ 
          message: 'Login successful', 
          success: true, 
          token: 'jwt-token-' + user.id, // Simple token for now
          user: { id: user.id, username: user.username, email: user.email } 
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ message: 'An error occurred during login', error: error.message });
    }
  });
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  try {
    // Check if the email exists
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database check error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Email not found' });
      }

      try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('New password hashed successfully');

        // Update the password
        const updateQuery = 'UPDATE users SET password = ?, last_updated = CURRENT_TIMESTAMP WHERE email = ?';
        db.query(updateQuery, [hashedPassword, email], (err, result) => {
          if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ message: 'Password update failed', error: err.message });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
          }
          
          console.log('Password updated successfully for email:', email);
          res.json({ message: 'Password updated successfully', success: true });
        });
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        return res.status(500).json({ message: 'Password hashing failed', error: hashError.message });
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'An error occurred during password reset', error: error.message });
  }
});

module.exports = router;