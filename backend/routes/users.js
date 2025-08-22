const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, run } = require('../config/database');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Search users by name or email
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const searchTerm = `%${q.trim()}%`;
    
    const result = await query(`
      SELECT id, name, email 
      FROM users 
      WHERE (name LIKE ? OR email LIKE ?) 
        AND id != ? 
      ORDER BY name 
      LIMIT 20
    `, [searchTerm, searchTerm, req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    // Check if email is already taken by another user
    const emailCheck = await query(`
      SELECT id FROM users WHERE email = ? AND id != ?
    `, [email, req.user.id]);

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already taken' });
    }

    // Update user profile
    await run(`
      UPDATE users SET name = ?, email = ? WHERE id = ?
    `, [name, email, req.user.id]);

    // Get updated user data
    const userResult = await query(`
      SELECT id, name, email, avatar FROM users WHERE id = ?
    `, [req.user.id]);

    res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
});

// Update user avatar
router.put('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar
    await run(`
      UPDATE users SET avatar = ? WHERE id = ?
    `, [avatarPath, req.user.id]);

    // Get updated user data
    const userResult = await query(`
      SELECT id, name, email, avatar FROM users WHERE id = ?
    `, [req.user.id]);

    res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
