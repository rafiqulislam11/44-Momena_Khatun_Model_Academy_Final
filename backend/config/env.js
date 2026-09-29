const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'momena_khatun_model_academy_default_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_PATH: path.resolve(__dirname, '../../', process.env.DB_PATH || 'database/momena_academy.db'),
  SCHOOL_NAME: process.env.SCHOOL_NAME || 'Momena Khatun Model Academy',
  SCHOOL_NAME_BN: process.env.SCHOOL_NAME_BN || 'মোমেনা খাতুন মডেল একাডেমি',
  SCHOOL_PHONE: process.env.SCHOOL_PHONE || '01771-907474',
  SCHOOL_ADDRESS: process.env.SCHOOL_ADDRESS || 'Jamirdia, Hobirbari-2240, Bhaluka, Mymensingh'
};
