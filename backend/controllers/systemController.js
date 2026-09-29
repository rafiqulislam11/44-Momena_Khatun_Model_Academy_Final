const config = require('../config/env');
const db = require('../config/db');

function getHealth(req, res) {
  try {
    const dbCheck = db.get('SELECT 1 as connected');
    const userCount = db.get('SELECT COUNT(*) as count FROM users');
    const classCount = db.get('SELECT COUNT(*) as count FROM classes');

    res.json({
      success: true,
      message: 'Momena Khatun Model Academy Smart Platform API is operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      school: {
        name: config.SCHOOL_NAME,
        nameBn: config.SCHOOL_NAME_BN,
        phone: config.SCHOOL_PHONE,
        address: config.SCHOOL_ADDRESS
      },
      database: {
        connected: dbCheck && dbCheck.connected === 1,
        users: userCount ? userCount.count : 0,
        classes: classCount ? classCount.count : 0
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'System health check failed',
      error: err.message
    });
  }
}

module.exports = {
  getHealth
};
