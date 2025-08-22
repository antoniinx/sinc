const express = require('express');
const { query } = require('../config/database');
const auth = require('../middleware/auth');

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

module.exports = router;
