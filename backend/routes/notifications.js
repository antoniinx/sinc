const express = require('express');
const { auth } = require('../middleware/auth');
const { query, queryOne, run } = require('../config/database');

const router = express.Router();

// Get all notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const sql = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    
    const result = await query(sql, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Chyba při načítání notifikací' });
  }
});

// Get unread notifications count
router.get('/unread', auth, async (req, res) => {
  try {
    const sql = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0';
    const result = await queryOne(sql, [req.user.id]);
    res.json({ count: result.row.count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Chyba při načítání počtu nepřečtených notifikací' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const sql = 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?';
    await run(sql, [notificationId, req.user.id]);

    res.json({ message: 'Notifikace byla označena jako přečtená' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Chyba při označování notifikace' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    const sql = 'UPDATE notifications SET is_read = 1 WHERE user_id = ?';
    await run(sql, [req.user.id]);

    res.json({ message: 'Všechny notifikace byly označeny jako přečtené' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Chyba při označování notifikací' });
  }
});

// Delete notification
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const sql = 'DELETE FROM notifications WHERE id = ? AND user_id = ?';
    await run(sql, [notificationId, req.user.id]);

    res.json({ message: 'Notifikace byla smazána' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Chyba při mazání notifikace' });
  }
});

// Delete all notifications
router.delete('/', auth, async (req, res) => {
  try {
    const sql = 'DELETE FROM notifications WHERE user_id = ?';
    await run(sql, [req.user.id]);

    res.json({ message: 'Všechny notifikace byly smazány' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: 'Chyba při mazání notifikací' });
  }
});

module.exports = router;
