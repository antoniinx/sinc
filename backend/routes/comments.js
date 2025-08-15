const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, queryOne, run } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get comments for an event
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if user is member of the group
    const memberCheck = await queryOne(`
      SELECT gm.* FROM group_members gm
      JOIN events e ON gm.group_id = e.group_id
      WHERE e.id = ? AND gm.user_id = ?
    `, [eventId, req.user.id]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(`
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.event_id = ?
      ORDER BY c.created_at
    `, [eventId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to event
router.post('/', [
  auth,
  body('eventId').isInt().withMessage('Valid event ID is required'),
  body('text').notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, text } = req.body;

    // Check if user is member of the group
    const memberCheck = await queryOne(`
      SELECT gm.* FROM group_members gm
      JOIN events e ON gm.group_id = e.group_id
      WHERE e.id = ? AND gm.user_id = ?
    `, [eventId, req.user.id]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add comment
    const result = await run(`
      INSERT INTO comments (event_id, user_id, text)
      VALUES (?, ?, ?)
    `, [eventId, req.user.id, text]);

    const commentId = result.rows[0].id;

    // Get the created comment
    const commentResult = await queryOne(`
      SELECT * FROM comments WHERE id = ?
    `, [commentId]);

    const comment = commentResult.rows[0];

    // Get user name for response
    const userResult = await queryOne('SELECT name FROM users WHERE id = ?', [req.user.id]);
    comment.user_name = userResult.rows[0].name;

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update comment
router.put('/:commentId', [
  auth,
  body('text').notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { commentId } = req.params;
    const { text } = req.body;

    // Get comment and check if user is the author
    const commentResult = await queryOne(`
      SELECT c.* FROM comments c
      WHERE c.id = ? AND c.user_id = ?
    `, [commentId, req.user.id]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    // Update comment
    await run(`
      UPDATE comments SET text = ? WHERE id = ?
    `, [text, commentId]);

    // Get updated comment
    const updatedCommentResult = await queryOne(`
      SELECT * FROM comments WHERE id = ?
    `, [commentId]);

    const comment = updatedCommentResult.rows[0];

    // Get user name for response
    const userResult = await queryOne('SELECT name FROM users WHERE id = ?', [req.user.id]);
    comment.user_name = userResult.rows[0].name;

    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Get comment and check if user is the author
    const commentResult = await queryOne(`
      SELECT c.* FROM comments c
      WHERE c.id = ? AND c.user_id = ?
    `, [commentId, req.user.id]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or access denied' });
    }

    // Delete comment
    await run('DELETE FROM comments WHERE id = ?', [commentId]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
