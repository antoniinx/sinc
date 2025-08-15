const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, queryOne, run } = require('../config/database');
const auth = require('../middleware/auth');
const { isGroupMember, isGroupAdmin, isGroupOwner } = require('../middleware/groupAuth');

const router = express.Router();

// Get all groups for current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await query(`
      SELECT g.*, gm.role, u.name as owner_name, g.is_public
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      JOIN users u ON g.owner_id = u.id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search public groups
router.get('/search/public', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = q ? `%${q}%` : '%';

    const result = await query(`
      SELECT g.*, u.name as owner_name
      FROM groups g
      JOIN users u ON g.owner_id = u.id
      WHERE g.is_public = 1 
        AND (g.name LIKE ? OR g.description LIKE ?)
        AND NOT EXISTS (
          SELECT 1 FROM group_members gm 
          WHERE gm.group_id = g.id AND gm.user_id = ?
        )
      ORDER BY g.created_at DESC
      LIMIT 20
    `, [searchTerm, searchTerm, req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Search public groups error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single group with members
router.get('/:groupId', auth, isGroupMember, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Get group details
    const groupResult = await queryOne(`
      SELECT g.*, u.name as owner_name, gm.role
      FROM groups g
      JOIN users u ON g.owner_id = u.id
      JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
      WHERE g.id = ?
    `, [req.user.id, groupId]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get group members
    const membersResult = await query(`
      SELECT u.id, u.name, u.email, gm.role, gm.created_at as joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.created_at
    `, [groupId]);

    const group = groupResult.rows[0];
    group.members = membersResult.rows;

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new group
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Group name is required'),
  body('description').optional(),
  body('color').optional().custom((value) => {
    if (value && !['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'].includes(value)) {
      throw new Error('Valid color is required');
    }
    return true;
  }),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, color, isPublic } = req.body;

    // Create group
    const groupResult = await run(`
      INSERT INTO groups (name, description, color, owner_id, is_public)
      VALUES (?, ?, ?, ?, ?)
    `, [name, description || null, color || '#3B82F6', req.user.id, isPublic ? 1 : 0]);

    const groupId = groupResult.rows[0].id;

    // Add owner as member
    await run(`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (?, ?, 'owner')
    `, [groupId, req.user.id]);
    
    // Get the created group with role
    const group = await queryOne(`
      SELECT g.*, gm.role, u.name as owner_name, g.is_public
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      JOIN users u ON g.owner_id = u.id
      WHERE g.id = ? AND gm.user_id = ?
    `, [groupId, req.user.id]);

    res.status(201).json(group.rows[0]);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add member to group
router.post('/:groupId/members', [
  auth,
  isGroupAdmin,
  body('userId').isInt().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId } = req.params;
    const { userId } = req.body;

    // Check if user exists
    const userResult = await queryOne('SELECT id FROM users WHERE id = ?', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already member
    const existingMember = await queryOne(`
      SELECT * FROM group_members WHERE group_id = ? AND user_id = ?
    `, [groupId, userId]);

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add member
    await run(`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (?, ?, 'member')
    `, [groupId, userId]);

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member from group
router.delete('/:groupId/members/:userId', auth, isGroupAdmin, async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    // Cannot remove owner
    const targetMember = await queryOne(`
      SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
    `, [groupId, userId]);

    if (targetMember.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (targetMember.rows[0].role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove group owner' });
    }

    // Remove member
    await run(`
      DELETE FROM group_members WHERE group_id = ? AND user_id = ?
    `, [groupId, userId]);

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update group
router.put('/:groupId', [
  auth,
  isGroupOwner,
  body('name').notEmpty().withMessage('Group name is required'),
  body('description').optional(),
  body('color').optional().custom((value) => {
    if (value && !['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'].includes(value)) {
      throw new Error('Valid color is required');
    }
    return true;
  }),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    console.log('Received group update request:', { groupId: req.params.groupId, body: req.body });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId } = req.params;
    const { name, description, color, isPublic } = req.body;

    // Update group
    const updateFields = ['name = ?'];
    const updateValues = [name];
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    
    if (color !== undefined) {
      updateFields.push('color = ?');
      updateValues.push(color);
    }
    
    // Always update is_public field
    updateFields.push('is_public = ?');
    updateValues.push(isPublic ? 1 : 0);
    console.log('Setting is_public to:', isPublic ? 1 : 0, 'from input:', isPublic, 'type:', typeof isPublic);
    
    updateValues.push(groupId);
    
    console.log('Update query:', `UPDATE groups SET ${updateFields.join(', ')} WHERE id = ?`);
    console.log('Update values:', updateValues);
    await run(`
      UPDATE groups SET ${updateFields.join(', ')} WHERE id = ?
    `, updateValues);

    // Get updated group with user role
    const result = await queryOne(`
      SELECT g.*, gm.role, u.name as owner_name, g.is_public
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      JOIN users u ON g.owner_id = u.id
      WHERE g.id = ? AND gm.user_id = ?
    `, [groupId, req.user.id]);
    
    console.log('Updated group result:', result.rows[0]);
    console.log('is_public value from database:', result.rows[0]?.is_public, 'type:', typeof result.rows[0]?.is_public);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update member role
router.put('/:groupId/members/:userId/role', [
  auth,
  isGroupOwner,
  body('role').isIn(['member', 'admin']).withMessage('Role must be member or admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId, userId } = req.params;
    const { role } = req.body;

    // Check if target member exists
    const targetMember = await queryOne(`
      SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
    `, [groupId, userId]);

    if (targetMember.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Cannot change owner's role
    if (targetMember.rows[0].role === 'owner') {
      return res.status(400).json({ error: 'Cannot change owner role' });
    }

    // Update member role
    await run(`
      UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?
    `, [role, groupId, userId]);

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete group
router.delete('/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is owner or admin of the group
    const memberCheck = await queryOne(`
      SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
    `, [groupId, req.user.id]);

    if (memberCheck.rows.length === 0 || (memberCheck.rows[0].role !== 'owner' && memberCheck.rows[0].role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete group (cascade will handle related records)
    const result = await run('DELETE FROM groups WHERE id = ?', [groupId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Leave group
router.post('/:groupId/leave', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is a member of the group
    const memberCheck = await queryOne(`
      SELECT role FROM group_members WHERE group_id = ? AND user_id = ?
    `, [groupId, req.user.id]);

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Not a member of this group' });
    }

    // Cannot leave if owner
    if (memberCheck.rows[0].role === 'owner') {
      return res.status(400).json({ error: 'Owner cannot leave the group. Transfer ownership or delete the group instead.' });
    }

    // Remove user from group
    await run(`
      DELETE FROM group_members WHERE group_id = ? AND user_id = ?
    `, [groupId, req.user.id]);

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join public group
router.post('/:groupId/join', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if group exists and is public
    const groupResult = await queryOne(`
      SELECT id, is_public FROM groups WHERE id = ?
    `, [groupId]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!groupResult.rows[0].is_public) {
      return res.status(403).json({ error: 'Group is not public' });
    }

    // Check if user is already a member
    const existingMember = await queryOne(`
      SELECT * FROM group_members WHERE group_id = ? AND user_id = ?
    `, [groupId, req.user.id]);

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'Already a member of this group' });
    }

    // Add user as member
    await run(`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (?, ?, 'member')
    `, [groupId, req.user.id]);

    // Get the group with user role
    const result = await queryOne(`
      SELECT g.*, gm.role, u.name as owner_name, g.is_public
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      JOIN users u ON g.owner_id = u.id
      WHERE g.id = ? AND gm.user_id = ?
    `, [groupId, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
