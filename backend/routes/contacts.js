const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, queryOne, run } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all contacts for current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.name, u.email, c.created_at as contact_created_at
      FROM contacts c
      JOIN users u ON c.contact_user_id = u.id
      WHERE c.user_id = ?
      ORDER BY u.name
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users to add as contacts
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const result = await query(`
      SELECT id, name, email
      FROM users
      WHERE (name LIKE ? OR email LIKE ?)
      AND id != ?
      AND id NOT IN (
        SELECT contact_user_id 
        FROM contacts 
        WHERE user_id = ?
      )
      ORDER BY name
      LIMIT 10
    `, [`%${q}%`, `%${q}%`, req.user.id, req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add contact
router.post('/', [
  auth,
  body('contactUserId').isInt().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contactUserId } = req.body;

    // Check if user exists
    const userResult = await queryOne('SELECT id FROM users WHERE id = ?', [contactUserId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if contact already exists
    const existingContact = await queryOne(
      'SELECT * FROM contacts WHERE user_id = ? AND contact_user_id = ?',
      [req.user.id, contactUserId]
    );

    if (existingContact.rows.length > 0) {
      return res.status(400).json({ error: 'Contact already exists' });
    }

    // Add contact
    const result = await run(`
      INSERT INTO contacts (user_id, contact_user_id)
      VALUES (?, ?)
    `, [req.user.id, contactUserId]);

    res.json({ message: 'Contact added successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove contact
router.delete('/:contactId', auth, async (req, res) => {
  try {
    const { contactId } = req.params;

    const result = await run(`
      DELETE FROM contacts
      WHERE user_id = ? AND contact_user_id = ?
    `, [req.user.id, contactId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact removed successfully' });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
