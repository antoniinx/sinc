const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, queryOne, run } = require('../config/database');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const uploadsRoot = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot);
}
const upload = multer({ dest: uploadsRoot });

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await queryOne(`
      SELECT id, name, email, avatar, notifications, created_at
      FROM users WHERE id = ?
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
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

    const { name, email, notifications } = req.body;

    // Check if email is already taken by another user
    const existingUser = await queryOne(`
      SELECT id FROM users WHERE email = ? AND id != ?
    `, [email, req.user.id]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already taken' });
    }

    // Update user profile
    await run(`
      UPDATE users 
      SET name = ?, email = ?, notifications = ?
      WHERE id = ?
    `, [name, email, notifications || false, req.user.id]);

    // Get updated profile
    const result = await queryOne(`
      SELECT id, name, email, avatar, notifications, created_at
      FROM users WHERE id = ?
    `, [req.user.id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update avatar
router.put('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Ensure uploads dir exists
    const uploadsDir = path.join(__dirname, '..', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir)
    }

    // Save file with user-specific name
    const ext = path.extname(req.file.originalname) || '.png'
    const targetPath = path.join(uploadsDir, `avatar_${req.user.id}${ext}`)
    fs.renameSync(req.file.path, targetPath)

    const publicPath = `/uploads/${path.basename(targetPath)}`

    await run(`UPDATE users SET avatar = ? WHERE id = ?`, [publicPath, req.user.id])

    const result = await queryOne(`
      SELECT id, name, email, avatar, notifications, created_at
      FROM users WHERE id = ?
    `, [req.user.id])

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update avatar error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Change password
router.put('/password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password hash
    const user = await queryOne(`
      SELECT password_hash FROM users WHERE id = ?
    `, [req.user.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await run(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `, [newPasswordHash, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account
router.delete('/account', [
  auth,
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;

    // Get current user with password hash
    const user = await queryOne(`
      SELECT password_hash FROM users WHERE id = ?
    `, [req.user.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Delete user (cascade will handle related records)
    await run('DELETE FROM users WHERE id = ?', [req.user.id]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
