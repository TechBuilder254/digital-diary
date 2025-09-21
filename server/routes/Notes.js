const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../config/db'); // Import the database connection

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use path.resolve for better cross-platform compatibility
    const uploadDir = path.resolve(__dirname, '../uploads/audio');
    
    // Ensure directory exists with proper error handling
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
        console.log('Created audio upload directory:', uploadDir);
      }
    } catch (error) {
      console.error('Error creating upload directory:', error);
      return cb(error, null);
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and sanitize for cross-platform compatibility
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = path.extname(sanitizedOriginalName) || '.webm';
    const filename = `audio-${uniqueSuffix}${extension}`;
    
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Create a new note
router.post('/', (req, res) => {
    const { title, content, category, tags, priority, is_favorite, audio_filename, audio_duration, audio_size, has_audio } = req.body;
  
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
  
    const query = 'INSERT INTO notes (title, content, category, tags, priority, is_favorite, audio_filename, audio_duration, audio_size, has_audio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [
      title, 
      content, 
      category || null, 
      tags || null, 
      priority || 'Medium', 
      is_favorite || 0,
      audio_filename || null,
      audio_duration || null,
      audio_size || null,
      has_audio || 0
    ], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database insert error', details: err.message });
  
      const newNote = {
        id: results.insertId,
        title,
        content,
        category: category || null,
        tags: tags || null,
        priority: priority || 'Medium',
        is_favorite: is_favorite || 0,
        audio_filename: audio_filename || null,
        audio_duration: audio_duration || null,
        audio_size: audio_size || null,
        has_audio: has_audio || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
  
      res.status(201).json(newNote);
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
  const { title, content, category, tags, priority, is_favorite, audio_filename, audio_duration, audio_size, has_audio } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const query = 'UPDATE notes SET title = ?, content = ?, category = ?, tags = ?, priority = ?, is_favorite = ?, audio_filename = ?, audio_duration = ?, audio_size = ?, has_audio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.query(query, [
    title, 
    content, 
    category || null, 
    tags || null, 
    priority || 'Medium', 
    is_favorite || 0,
    audio_filename || null,
    audio_duration || null,
    audio_size || null,
    has_audio || 0,
    id
  ], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database update error', details: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Note not found' });
    
    // Return the updated note
    db.query('SELECT * FROM notes WHERE id = ?', [id], (err, updatedNote) => {
      if (err) return res.status(500).json({ error: 'Database query error', details: err.message });
      res.status(200).json(updatedNote[0]);
    });
  });
});

// Toggle favorite status
router.patch('/:id/favorite', (req, res) => {
  const { id } = req.params;
  const { is_favorite } = req.body;

  const query = 'UPDATE notes SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.query(query, [is_favorite ? 1 : 0, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database update error', details: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Note not found' });
    
    res.status(200).json({ message: 'Favorite status updated successfully', is_favorite: is_favorite ? 1 : 0 });
  });
});

// Get notes by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  
  const query = 'SELECT * FROM notes WHERE category = ? ORDER BY created_at DESC';
  db.query(query, [category], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error', details: err.message });
    res.status(200).json(results);
  });
});

// Get favorite notes
router.get('/favorites', (req, res) => {
  const query = 'SELECT * FROM notes WHERE is_favorite = 1 ORDER BY updated_at DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query error', details: err.message });
    res.status(200).json(results);
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

// Upload audio file
router.post('/upload-audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const audioData = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    path: req.file.path,
    url: `/api/notes/audio/${req.file.filename}`
  };

  res.status(200).json(audioData);
});

// Serve audio files
router.get('/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Sanitize filename to prevent directory traversal attacks
  const sanitizedFilename = path.basename(filename);
  if (sanitizedFilename !== filename) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  // Use path.resolve for better cross-platform compatibility
  const filePath = path.resolve(__dirname, '../uploads/audio', sanitizedFilename);
  
  // Additional security check - ensure file is within uploads directory
  const uploadsDir = path.resolve(__dirname, '../uploads/audio');
  if (!filePath.startsWith(uploadsDir)) {
    return res.status(400).json({ error: 'Invalid file path' });
  }
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log('Audio file not found:', filePath);
    return res.status(404).json({ error: 'Audio file not found' });
  }

  // Get file stats for better headers
  try {
    const stats = fs.statSync(filePath);
    
    // Set appropriate headers for audio streaming
    res.setHeader('Content-Type', 'audio/webm');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      console.error('Error streaming audio file:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming audio file' });
      }
    });
    
  } catch (error) {
    console.error('Error accessing audio file:', error);
    res.status(500).json({ error: 'Error accessing audio file' });
  }
});

module.exports = router;