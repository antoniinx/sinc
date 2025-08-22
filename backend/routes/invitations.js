const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { query, queryOne, run } = require('../config/database');

const router = express.Router();

// Get all invitations for current user
router.get('/', auth, async (req, res) => {
  try {
    const sql = `
      SELECT 
        ei.*,
        e.title as event_title,
        e.date as event_date,
        e.time as event_time,
        e.location as event_location,
        u1.name as inviter_name,
        u1.email as inviter_email,
        u2.name as invitee_name,
        u2.email as invitee_email
      FROM event_invitations ei
      JOIN events e ON ei.event_id = e.id
      JOIN users u1 ON ei.inviter_id = u1.id
      JOIN users u2 ON ei.invitee_id = u2.id
      WHERE ei.invitee_id = ?
      ORDER BY ei.created_at DESC
    `;
    
    const result = await query(sql, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Chyba při načítání pozvánek' });
  }
});

// Send invitation to event
router.post('/', [
  auth,
  body('eventId').isInt().withMessage('Event ID musí být číslo'),
  body('inviteeEmail').isEmail().withMessage('Neplatný email'),
  body('message').optional().isString().withMessage('Zpráva musí být text')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, inviteeEmail, message } = req.body;

    // Check if event exists and user is creator
    const eventSql = 'SELECT * FROM events WHERE id = ? AND creator_id = ?';
    const eventResult = await queryOne(eventSql, [eventId, req.user.id]);
    
    if (!eventResult.row) {
      return res.status(404).json({ error: 'Událost nenalezena nebo nemáte oprávnění' });
    }

    // Find invitee by email
    const inviteeSql = 'SELECT * FROM users WHERE email = ?';
    const inviteeResult = await queryOne(inviteeSql, [inviteeEmail]);
    
    if (!inviteeResult.row) {
      return res.status(404).json({ error: 'Uživatel s tímto emailem nebyl nalezen' });
    }

    const invitee = inviteeResult.row;

    // Check if invitation already exists
    const existingSql = 'SELECT * FROM event_invitations WHERE event_id = ? AND invitee_id = ?';
    const existingResult = await queryOne(existingSql, [eventId, invitee.id]);
    
    if (existingResult.row) {
      return res.status(400).json({ error: 'Pozvánka již byla odeslána' });
    }

    // Create invitation
    const insertSql = `
      INSERT INTO event_invitations (event_id, inviter_id, invitee_id, message)
      VALUES (?, ?, ?, ?)
    `;
    
    const insertResult = await run(insertSql, [eventId, req.user.id, invitee.id, message || null]);

    // Create notification for invitee
    const notificationSql = `
      INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
      VALUES (?, 'event_invitation', 'Nová pozvánka na událost', ?, ?, 'event')
    `;
    
    await run(notificationSql, [
      invitee.id, 
      `Byli jste pozváni na událost "${eventResult.row.title}"`,
      eventId
    ]);

    res.json({ 
      message: 'Pozvánka byla odeslána',
      invitationId: insertResult.lastID 
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Chyba při odesílání pozvánky' });
  }
});

// Respond to invitation (accept/decline/suggest)
router.put('/:invitationId', [
  auth,
  body('status').isIn(['accepted', 'declined', 'suggested']).withMessage('Neplatný status'),
  body('suggestedDate').optional().isString().withMessage('Datum musí být text'),
  body('suggestedTime').optional().isString().withMessage('Čas musí být text')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { invitationId } = req.params;
    const { status, suggestedDate, suggestedTime } = req.body;

    // Check if invitation exists and belongs to user
    const invitationSql = `
      SELECT ei.*, e.title as event_title, u.name as inviter_name
      FROM event_invitations ei
      JOIN events e ON ei.event_id = e.id
      JOIN users u ON ei.inviter_id = u.id
      WHERE ei.id = ? AND ei.invitee_id = ?
    `;
    
    const invitationResult = await queryOne(invitationSql, [invitationId, req.user.id]);
    
    if (!invitationResult.row) {
      return res.status(404).json({ error: 'Pozvánka nenalezena' });
    }

    const invitation = invitationResult.row;

    // Update invitation status
    let updateSql = 'UPDATE event_invitations SET status = ?';
    let updateParams = [status];

    if (status === 'suggested' && suggestedDate && suggestedTime) {
      updateSql += ', suggested_date = ?, suggested_time = ?';
      updateParams.push(suggestedDate, suggestedTime);
    }

    updateSql += ' WHERE id = ?';
    updateParams.push(invitationId);

    await run(updateSql, updateParams);

    // Create notification for inviter
    let notificationMessage = '';
    if (status === 'accepted') {
      notificationMessage = `${req.user.name} přijal/a pozvánku na událost "${invitation.event_title}"`;
    } else if (status === 'declined') {
      notificationMessage = `${req.user.name} odmítl/a pozvánku na událost "${invitation.event_title}"`;
    } else if (status === 'suggested') {
      notificationMessage = `${req.user.name} navrhl/a jiný termín pro událost "${invitation.event_title}"`;
    }

    const notificationSql = `
      INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
      VALUES (?, 'invitation_response', 'Odpověď na pozvánku', ?, ?, 'event')
    `;
    
    await run(notificationSql, [
      invitation.inviter_id,
      notificationMessage,
      invitation.event_id
    ]);

    res.json({ message: 'Odpověď byla odeslána' });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({ error: 'Chyba při odpovídání na pozvánku' });
  }
});

// Delete invitation
router.delete('/:invitationId', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;

    // Check if invitation exists and user is inviter
    const invitationSql = 'SELECT * FROM event_invitations WHERE id = ? AND inviter_id = ?';
    const invitationResult = await queryOne(invitationSql, [invitationId, req.user.id]);
    
    if (!invitationResult.row) {
      return res.status(404).json({ error: 'Pozvánka nenalezena nebo nemáte oprávnění' });
    }

    // Delete invitation
    await run('DELETE FROM event_invitations WHERE id = ?', [invitationId]);

    res.json({ message: 'Pozvánka byla smazána' });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({ error: 'Chyba při mazání pozvánky' });
  }
});

module.exports = router;
