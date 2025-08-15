const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, queryOne, run } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all friends (accepted friendships)
router.get('/', auth, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.name, u.email, u.avatar,
        f.id as friendship_id, f.status, f.created_at as friendship_created_at
      FROM friendships f
      JOIN users u ON (f.friend_id = u.id OR f.user_id = u.id)
      WHERE (f.user_id = ? OR f.friend_id = ?) 
        AND f.status = 'accepted'
        AND u.id != ?
    `, [req.user.id, req.user.id, req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending friend requests (received)
router.get('/pending', auth, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.name, u.email, u.avatar,
        f.id as friendship_id, f.created_at as request_created_at
      FROM friendships f
      JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = ? AND f.status = 'pending'
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get sent friend requests
router.get('/sent', auth, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.name, u.email, u.avatar,
        f.id as friendship_id, f.created_at as request_created_at
      FROM friendships f
      JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ? AND f.status = 'pending'
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send friend request
router.post('/request', [
  auth,
  body('friendEmail').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { friendEmail } = req.body;

    // Check if user exists
    const friendResult = await queryOne('SELECT id, name FROM users WHERE email = ?', [friendEmail]);
    if (!friendResult.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friend = friendResult.rows[0];
    
    // Can't send request to yourself
    if (friend.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if friendship already exists
    const existingResult = await queryOne(`
      SELECT id, status FROM friendships 
      WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
    `, [req.user.id, friend.id, friend.id, req.user.id]);

    if (existingResult.rows.length) {
      const existing = existingResult.rows[0];
      if (existing.status === 'accepted') {
        return res.status(400).json({ error: 'Already friends' });
      } else if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Friend request already sent' });
      }
    }

    // Create friend request
    await run('INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)', 
      [req.user.id, friend.id, 'pending']);

    res.json({ 
      message: 'Friend request sent successfully',
      friend: { id: friend.id, name: friend.name, email: friendEmail }
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept friend request
router.put('/accept/:friendshipId', auth, async (req, res) => {
  try {
    const { friendshipId } = req.params;

    // Check if friendship exists and user is the recipient
    const friendshipResult = await queryOne(`
      SELECT id, user_id, friend_id, status 
      FROM friendships 
      WHERE id = ? AND friend_id = ? AND status = 'pending'
    `, [friendshipId, req.user.id]);

    if (!friendshipResult.rows.length) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Accept the request
    await run('UPDATE friendships SET status = ? WHERE id = ?', ['accepted', friendshipId]);

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject friend request
router.put('/reject/:friendshipId', auth, async (req, res) => {
  try {
    const { friendshipId } = req.params;

    // Check if friendship exists and user is the recipient
    const friendshipResult = await queryOne(`
      SELECT id, user_id, friend_id, status 
      FROM friendships 
      WHERE id = ? AND friend_id = ? AND status = 'pending'
    `, [friendshipId, req.user.id]);

    if (!friendshipResult.rows.length) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Delete the request
    await run('DELETE FROM friendships WHERE id = ?', [friendshipId]);

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove friend
router.delete('/:friendshipId', auth, async (req, res) => {
  try {
    const { friendshipId } = req.params;

    // Check if friendship exists and user is part of it
    const friendshipResult = await queryOne(`
      SELECT id, user_id, friend_id, status 
      FROM friendships 
      WHERE id = ? AND (user_id = ? OR friend_id = ?) AND status = 'accepted'
    `, [friendshipId, req.user.id, req.user.id]);

    if (!friendshipResult.rows.length) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    // Remove the friendship
    await run('DELETE FROM friendships WHERE id = ?', [friendshipId]);

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get friend's calendar (events from their groups)
router.get('/:friendId/calendar', auth, async (req, res) => {
  try {
    const { friendId } = req.params;

    // Check if they are friends
    const friendshipResult = await queryOne(`
      SELECT id FROM friendships 
      WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
        AND status = 'accepted'
    `, [req.user.id, friendId, friendId, req.user.id]);

    if (!friendshipResult.rows.length) {
      return res.status(403).json({ error: 'Not friends with this user' });
    }

    // Get friend's events from their groups
    const eventsResult = await query(`
      SELECT 
        e.id, e.title, e.description, e.date, e.time, e.end_date, e.end_time, 
        e.location, e.image_url, e.created_at,
        g.name as group_name, g.color as group_color,
        u.name as creator_name
      FROM events e
      JOIN groups g ON e.group_id = g.id
      JOIN group_members gm ON g.id = gm.group_id
      JOIN users u ON e.creator_id = u.id
      WHERE gm.user_id = ? AND gm.role IN ('owner', 'admin', 'member')
      ORDER BY e.date ASC, e.time ASC
    `, [friendId]);

    res.json(eventsResult.rows);
  } catch (error) {
    console.error('Error fetching friend calendar:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get friend's events with attendance information
router.get('/:friendId/events', auth, async (req, res) => {
  try {
    const { friendId } = req.params;

    // Check if they are friends
    const friendshipResult = await queryOne(`
      SELECT id FROM friendships 
      WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
        AND status = 'accepted'
    `, [req.user.id, friendId, friendId, req.user.id]);

    if (!friendshipResult.rows.length) {
      return res.status(403).json({ error: 'Not friends with this user' });
    }

    // Get friend's events with attendance information
    const eventsResult = await query(`
      SELECT 
        e.id, e.title, e.description, e.date, e.time, e.end_date, e.end_time, 
        e.location, e.image_url, e.created_at,
        g.name as group_name, g.color as group_color,
        u.name as creator_name
      FROM events e
      JOIN groups g ON e.group_id = g.id
      JOIN group_members gm ON g.id = gm.group_id
      JOIN users u ON e.creator_id = u.id
      WHERE gm.user_id = ? AND gm.role IN ('owner', 'admin', 'member')
      ORDER BY e.date ASC, e.time ASC
    `, [friendId]);

    // Get attendance information for each event
    const eventsWithAttendance = await Promise.all(
      eventsResult.rows.map(async (event) => {
        const attendeesResult = await query(`
          SELECT u.id, u.name, u.email, ea.status
          FROM event_attendees ea
          JOIN users u ON ea.user_id = u.id
          WHERE ea.event_id = ?
          ORDER BY ea.created_at
        `, [event.id]);

        return {
          ...event,
          attendees: attendeesResult.rows
        };
      })
    );

    res.json(eventsWithAttendance);
  } catch (error) {
    console.error('Error fetching friend events:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users to add as friends (by name or email), excluding self and existing/pending relationships
router.get('/search/:term', auth, async (req, res) => {
  try {
    const { term } = req.params;

    const likeTerm = `%${term}%`;

    const result = await query(`
      SELECT u.id, u.name, u.email, u.avatar
      FROM users u
      WHERE (LOWER(u.email) LIKE LOWER(?) OR LOWER(u.name) LIKE LOWER(?))
        AND u.id != ?
        AND NOT EXISTS (
          SELECT 1 FROM friendships f
          WHERE (
            (f.user_id = u.id AND f.friend_id = ?) OR
            (f.user_id = ? AND f.friend_id = u.id)
          ) AND f.status IN ('pending','accepted')
        )
      LIMIT 10
    `, [likeTerm, likeTerm, req.user.id, req.user.id, req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
