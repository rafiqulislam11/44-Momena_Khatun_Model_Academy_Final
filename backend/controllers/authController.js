const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../config/db');

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const user = db.get('SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?', [username, username, username]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Please contact administrator.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    // Update last_login
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Issue JWT Token
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });

    // Fetch Role-Specific Profile Metadata
    let roleData = {};
    if (user.role === 'TEACHER') {
      roleData = db.get('SELECT * FROM teachers WHERE user_id = ?', [user.id]) || {};
    } else if (user.role === 'STUDENT') {
      roleData = db.get(`
        SELECT s.*, c.name as class_name, c.name_bn as class_name_bn, sec.name as section_name
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        WHERE s.user_id = ?
      `, [user.id]) || {};
    } else if (user.role === 'GUARDIAN') {
      const guardian = db.get('SELECT * FROM guardians WHERE user_id = ?', [user.id]) || {};
      const children = db.all(`
        SELECT s.*, c.name as class_name, sec.name as section_name, u.full_name as student_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        WHERE s.guardian_id = ?
      `, [guardian.id || 0]);
      roleData = { ...guardian, children };
    }

    // Audit log
    db.run(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES (?, 'LOGIN', 'USER', ?, 'Successful user login', ?)
    `, [user.id, user.id, req.ip]);

    // Clean user object
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        ...safeUser,
        roleData
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: err.message
    });
  }
}

async function getProfile(req, res) {
  try {
    const user = db.get('SELECT id, username, role, full_name, full_name_bn, email, phone, avatar, status, last_login, created_at FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    let roleData = {};
    if (user.role === 'TEACHER') {
      roleData = db.get('SELECT * FROM teachers WHERE user_id = ?', [user.id]) || {};
    } else if (user.role === 'STUDENT') {
      roleData = db.get(`
        SELECT s.*, c.name as class_name, c.name_bn as class_name_bn, sec.name as section_name
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        WHERE s.user_id = ?
      `, [user.id]) || {};
    } else if (user.role === 'GUARDIAN') {
      const guardian = db.get('SELECT * FROM guardians WHERE user_id = ?', [user.id]) || {};
      const children = db.all(`
        SELECT s.*, c.name as class_name, sec.name as section_name, u.full_name as student_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        WHERE s.guardian_id = ?
      `, [guardian.id || 0]);
      roleData = { ...guardian, children };
    }

    res.json({
      success: true,
      user: {
        ...user,
        roleData
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { full_name, full_name_bn, email, phone, avatar } = req.body;

    db.run(`
      UPDATE users
      SET full_name = COALESCE(?, full_name),
          full_name_bn = COALESCE(?, full_name_bn),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          avatar = COALESCE(?, avatar),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [full_name, full_name_bn, email, phone, avatar, req.user.id]);

    const updatedUser = db.get('SELECT id, username, role, full_name, full_name_bn, email, phone, avatar, status FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: err.message });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHash, req.user.id]);

    db.run(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES (?, 'CHANGE_PASSWORD', 'USER', ?, 'User changed their password', ?)
    `, [req.user.id, req.user.id, req.ip]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to change password', error: err.message });
  }
}

function logout(req, res) {
  if (req.user) {
    db.run(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES (?, 'LOGOUT', 'USER', ?, 'User logged out', ?)
    `, [req.user.id, req.user.id, req.ip]);
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}

module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
};
