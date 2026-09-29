const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Serve Frontend Static Assets & Web Pages (frontend directory + project root fallback)
app.use(express.static(path.resolve(__dirname, '../frontend')));
app.use(express.static(path.resolve(__dirname, '..')));

// API Routes
app.use('/api/system', require('./routes/systemRoutes'));

// Mount placeholder routes for upcoming phases (will be linked seamlessly in subsequent phases)
try { app.use('/api/auth', require('./routes/authRoutes')); } catch(e) {}
try { app.use('/api/academic', require('./routes/academicRoutes')); } catch(e) {}
try { app.use('/api/students', require('./routes/studentRoutes')); } catch(e) {}
try { app.use('/api/attendance', require('./routes/attendanceRoutes')); } catch(e) {}
try { app.use('/api/exams', require('./routes/examRoutes')); } catch(e) {}
try { app.use('/api/notices', require('./routes/noticeRoutes')); } catch(e) {}
try { app.use('/api/routines', require('./routes/routineRoutes')); } catch(e) {}
try { app.use('/api/homework', require('./routes/homeworkRoutes')); } catch(e) {}
try { app.use('/api/dashboard', require('./routes/dashboardRoutes')); } catch(e) {}
try { app.use('/api/reports', require('./routes/reportRoutes')); } catch(e) {}

// Fallback for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Portal route fallback
app.get('/portal', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/portal.html'));
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`================================================================`);
    console.log(`🎓 ${config.SCHOOL_NAME} — Smart School Platform`);
    console.log(`🌐 Server running at: http://localhost:${config.PORT}`);
    console.log(`🚀 API Health: http://localhost:${config.PORT}/api/system/health`);
    console.log(`📂 Environment: ${config.NODE_ENV}`);
    console.log(`================================================================`);
  });
}

module.exports = app;
