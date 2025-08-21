const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, queryOne, run } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all events for groups where user is member
router.get('/', auth, async (req, res) => {
  try {
    const result = await query(`
      SELECT e.*, g.name as group_name, u.name as creator_name,
             ea.status as user_status
      FROM events e
      JOIN groups g ON e.group_id = g.id
      JOIN users u ON e.creator_id = u.id
      LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.user_id = ?
      WHERE e.group_id IN (
        SELECT group_id FROM group_members WHERE user_id = ?
      )
      ORDER BY e.date DESC, e.time DESC
    `, [req.user.id, req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get events for specific group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is member of the group
    const memberCheck = await queryOne(`
      SELECT * FROM group_members WHERE group_id = ? AND user_id = ?
    `, [groupId, req.user.id]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(`
      SELECT e.*, u.name as creator_name, ea.status as user_status
      FROM events e
      JOIN users u ON e.creator_id = u.id
      LEFT JOIN event_attendees ea ON e.id = ea.event_id AND ea.user_id = ?
      WHERE e.group_id = ?
      ORDER BY e.date DESC, e.time DESC
    `, [req.user.id, groupId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get group events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single event with attendees and comments
router.get('/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get event details
    const eventResult = await queryOne(`
      SELECT e.*, g.name as group_name, u.name as creator_name, ea.status as user_status
      FROM events e
      JOIN groups g ON e.group_id = g.id
      JOIN users u ON e.creator_id = u.id
      LEFT JOIN event_attendees ea ON ea.event_id = e.id AND ea.user_id = ?
      WHERE e.id = ?
    `, [req.user.id, eventId]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // Check if user is member of the group
    const memberCheck = await queryOne(`
      SELECT * FROM group_members WHERE group_id = ? AND user_id = ?
    `, [event.group_id, req.user.id]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get attendees
    const attendeesResult = await query(`
      SELECT u.id, u.name, u.email, ea.status, ea.created_at
      FROM event_attendees ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = ?
      ORDER BY ea.created_at
    `, [eventId]);

    // Get comments
    const commentsResult = await query(`
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.event_id = ?
      ORDER BY c.created_at
    `, [eventId]);

    // Get tasks
    const tasksResult = await query(`
      SELECT t.*, cu.name as created_by_name, au.name as assignee_name
      FROM event_tasks t
      LEFT JOIN users cu ON t.created_by = cu.id
      LEFT JOIN users au ON t.assignee_id = au.id
      WHERE t.event_id = ?
      ORDER BY t.created_at DESC
    `, [eventId]);

    event.attendees = attendeesResult.rows;
    event.comments = commentsResult.rows;
    event.tasks = tasksResult.rows;

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new event
router.post('/', [
  auth,
  body('groupId').optional(),
  body('title').notEmpty().withMessage('Event title is required'),
  body('date').notEmpty().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId, title, description, date, time, endDate, endTime, location, imageUrl } = req.body;
    
    console.log('Received event data:', { groupId, title, description, date, time, endDate, endTime, location, imageUrl })

    // If no groupId provided, use the first group the user is member of
    let finalGroupId = groupId;
    if (!finalGroupId) {
      const userGroupsResult = await queryOne(`
        SELECT group_id FROM group_members WHERE user_id = ? LIMIT 1
      `, [req.user.id]);
      
      if (userGroupsResult.rows.length === 0) {
        return res.status(400).json({ error: 'User must be member of at least one group to create events' });
      }
      
      finalGroupId = userGroupsResult.rows[0].group_id;
      console.log('Using default group ID:', finalGroupId);
    }

    // Check if user is member of the group
    const memberCheck = await queryOne(`
      SELECT * FROM group_members WHERE group_id = ? AND user_id = ?
    `, [finalGroupId, req.user.id]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create event
    console.log('Inserting event with values:', [finalGroupId, req.user.id, title, description, date, time, endDate, endTime, location, imageUrl])
    const result = await run(`
      INSERT INTO events (group_id, creator_id, title, description, date, time, end_date, end_time, location, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [finalGroupId, req.user.id, title, description, date, time, endDate, endTime, location, imageUrl]);

    const eventId = result.rows[0].id;

    // Get the created event
    const eventResult = await queryOne(`
      SELECT * FROM events WHERE id = ?
    `, [eventId]);

    const event = eventResult.rows[0];
    console.log('Created event from database:', event)

    // Add creator as attendee with 'yes' status
    await run(`
      INSERT INTO event_attendees (event_id, user_id, status)
      VALUES (?, ?, 'yes')
    `, [eventId, req.user.id]);

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event
router.put('/:eventId', [
  auth,
  body('title').notEmpty().withMessage('Event title is required'),
  body('date').isDate().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId } = req.params;
    const { title, description, date, time, endDate, endTime, location, imageUrl } = req.body;

    // Get event and check permissions
    const eventResult = await queryOne(`
      SELECT e.*, gm.role
      FROM events e
      JOIN group_members gm ON e.group_id = gm.group_id
      WHERE e.id = ? AND gm.user_id = ?
    `, [eventId, req.user.id]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // Only creator or group owner/admin can edit
    if (event.creator_id !== req.user.id && !['owner', 'admin'].includes(event.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update event
    await run(`
      UPDATE events 
      SET title = ?, description = ?, date = ?, time = ?, end_date = ?, end_time = ?, location = ?, image_url = ?
      WHERE id = ?
    `, [title, description, date, time, endDate, endTime, location, imageUrl, eventId]);

    // Get updated event
    const updatedEventResult = await queryOne(`
      SELECT * FROM events WHERE id = ?
    `, [eventId]);

    res.json(updatedEventResult.rows[0]);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete event
router.delete('/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get event and check permissions
    const eventResult = await queryOne(`
      SELECT e.*, gm.role
      FROM events e
      JOIN group_members gm ON e.group_id = gm.group_id
      WHERE e.id = ? AND gm.user_id = ?
    `, [eventId, req.user.id]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // Only creator or group owner/admin can delete
    if (event.creator_id !== req.user.id && !['owner', 'admin'].includes(event.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete event (cascade will handle related records)
    await run('DELETE FROM events WHERE id = ?', [eventId]);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update attendance status
router.put('/:eventId/attend', [
  auth,
  body('status').isIn(['yes', 'maybe', 'no']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId } = req.params;
    const { status } = req.body;

    // Check if user is member of the group
    const memberCheck = await queryOne(`
      SELECT gm.* FROM group_members gm
      JOIN events e ON gm.group_id = e.group_id
      WHERE e.id = ? AND gm.user_id = ?
    `, [eventId, req.user.id]);

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if attendance record exists
    const existingAttendance = await queryOne(`
      SELECT * FROM event_attendees WHERE event_id = ? AND user_id = ?
    `, [eventId, req.user.id]);

    if (existingAttendance.rows.length > 0) {
      // Update existing attendance
      await run(`
        UPDATE event_attendees SET status = ? WHERE event_id = ? AND user_id = ?
      `, [status, eventId, req.user.id]);
    } else {
      // Insert new attendance
      await run(`
        INSERT INTO event_attendees (event_id, user_id, status)
        VALUES (?, ?, ?)
      `, [eventId, req.user.id, status]);
    }

    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Tasks: list, create, assign, unassign, complete, delete
router.get('/:eventId/tasks', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await query(`
      SELECT t.*, cu.name as created_by_name, au.name as assignee_name
      FROM event_tasks t
      LEFT JOIN users cu ON t.created_by = cu.id
      LEFT JOIN users au ON t.assignee_id = au.id
      WHERE t.event_id = ?
      ORDER BY t.created_at DESC
    `, [eventId]);
    res.json(result.rows);
  } catch (error) {
    console.error('List tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:eventId/tasks', [auth, body('text').notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { eventId } = req.params;
    const { text } = req.body;
    const insertRes = await run(`INSERT INTO event_tasks (event_id, text, created_by, status) VALUES (?, ?, ?, 'open')`, [eventId, text, req.user.id]);
    const created = await queryOne(`
      SELECT t.*, cu.name as created_by_name, au.name as assignee_name
      FROM event_tasks t
      LEFT JOIN users cu ON t.created_by = cu.id
      LEFT JOIN users au ON t.assignee_id = au.id
      WHERE t.id = ?
    `, [insertRes.rows[0].id]);
    res.status(201).json(created.rows[0]);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/tasks/:taskId/assign', [auth, body('assigneeId').optional()], async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assigneeId } = req.body;
    await run(`UPDATE event_tasks SET assignee_id = ? WHERE id = ?`, [assigneeId || null, taskId]);
    const updated = await queryOne(`
      SELECT t.*, cu.name as created_by_name, au.name as assignee_name
      FROM event_tasks t
      LEFT JOIN users cu ON t.created_by = cu.id
      LEFT JOIN users au ON t.assignee_id = au.id
      WHERE t.id = ?
    `, [taskId]);
    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/tasks/:taskId/status', [auth, body('status').isIn(['open','in_progress','done'])], async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    await run(`UPDATE event_tasks SET status = ? WHERE id = ?`, [status, taskId]);
    const updated = await queryOne(`
      SELECT t.*, cu.name as created_by_name, au.name as assignee_name
      FROM event_tasks t
      LEFT JOIN users cu ON t.created_by = cu.id
      LEFT JOIN users au ON t.assignee_id = au.id
      WHERE t.id = ?
    `, [taskId]);
    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/tasks/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    await run('DELETE FROM event_tasks WHERE id = ?', [taskId]);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
