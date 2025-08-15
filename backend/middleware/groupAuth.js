const { queryOne } = require('../config/database');

// Middleware to check if user is a member of the group
const isGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    
    const result = await queryOne(`
      SELECT gm.role 
      FROM group_members gm 
      WHERE gm.group_id = ? AND gm.user_id = ?
    `, [groupId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. You are not a member of this group.' });
    }

    req.groupRole = result.rows[0].role;
    next();
  } catch (error) {
    console.error('Group member check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Middleware to check if user is admin or owner
const isGroupAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    
    const result = await queryOne(`
      SELECT gm.role 
      FROM group_members gm 
      WHERE gm.group_id = ? AND gm.user_id = ? AND gm.role IN ('admin', 'owner')
    `, [groupId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. Admin or owner privileges required.' });
    }

    req.groupRole = result.rows[0].role;
    next();
  } catch (error) {
    console.error('Group admin check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Middleware to check if user is owner only
const isGroupOwner = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    
    const result = await queryOne(`
      SELECT gm.role 
      FROM group_members gm 
      WHERE gm.group_id = ? AND gm.user_id = ? AND gm.role = 'owner'
    `, [groupId, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. Owner privileges required.' });
    }

    req.groupRole = result.rows[0].role;
    next();
  } catch (error) {
    console.error('Group owner check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  isGroupMember,
  isGroupAdmin,
  isGroupOwner
};
