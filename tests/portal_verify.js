const http = require('http');

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('🚀 Running Multi-Role Smart Portal API & Business Logic Integration Suite...\n');

  try {
    // 1. Super Admin Authentication
    console.log('Step 1: Super Admin Login...');
    const adminLogin = await request('POST', '/api/auth/login', { username: 'superadmin', password: 'Admin@123' });
    if (adminLogin.status !== 200 || !adminLogin.data.token) throw new Error('Admin login failed');
    const adminToken = adminLogin.data.token;
    console.log(`  ✅ Logged in as: ${adminLogin.data.user.full_name} (${adminLogin.data.user.role})`);

    // 2. Admin Dashboard Metrics
    console.log('Step 2: Admin Dashboard Analytics...');
    const adminDash = await request('GET', '/api/dashboard', null, adminToken);
    if (adminDash.status !== 200) throw new Error('Admin dashboard fetch failed');
    const metrics = adminDash.data.data.metrics;
    console.log(`  ✅ Stats: Students=${metrics.totalStudents}, Teachers=${metrics.totalTeachers}, Classes=${metrics.totalClasses}`);

    // 3. Teacher Authentication & Attendance Workflow
    console.log('Step 3: Teacher Login & Mark Attendance...');
    const teacherLogin = await request('POST', '/api/auth/login', { username: 'teacher.math', password: 'Teacher@123' });
    if (teacherLogin.status !== 200) throw new Error('Teacher login failed');
    const teacherToken = teacherLogin.data.token;
    console.log(`  ✅ Logged in as Teacher: ${teacherLogin.data.user.full_name}`);

    // Mark all present for Class 1 (ID 4), Section A (ID 1)
    const today = new Date().toISOString().split('T')[0];
    const markAll = await request('POST', '/api/attendance/mark-all-present', {
      academic_year_id: 1,
      class_id: 4,
      section_id: 1,
      date: today
    }, teacherToken);
    if (markAll.status !== 200) throw new Error('Bulk attendance failed');
    console.log(`  ✅ Marked all present: ${markAll.data.message}`);

    // 4. Student Authentication & Report Card / Transcript
    console.log('Step 4: Student Login & Report Card Verification...');
    const studentLogin = await request('POST', '/api/auth/login', { username: 'student.101', password: 'Student@123' });
    if (studentLogin.status !== 200) throw new Error('Student login failed');
    const studentToken = studentLogin.data.token;
    console.log(`  ✅ Logged in as Student: ${studentLogin.data.user.full_name}`);

    const reportCard = await request('GET', '/api/exams/report-card/1/1', null, studentToken);
    if (reportCard.status !== 200) throw new Error('Report card fetch failed');
    const summary = reportCard.data.data.summary;
    console.log(`  ✅ Academic Performance: GPA=${summary.gpa}, Grade=${summary.finalGrade}, Status=${summary.status}, Total Marks=${summary.grandTotal}/${summary.maxGrandTotal}`);

    // 5. Guardian Authentication & Multi-child Access
    console.log('Step 5: Guardian Login & Children Verification...');
    const guardianLogin = await request('POST', '/api/auth/login', { username: 'guardian.rofiq', password: 'Guardian@123' });
    if (guardianLogin.status !== 200) throw new Error('Guardian login failed');
    const guardianToken = guardianLogin.data.token;
    console.log(`  ✅ Logged in as Guardian: ${guardianLogin.data.user.full_name}`);

    const guardianDash = await request('GET', '/api/dashboard', null, guardianToken);
    if (guardianDash.status !== 200) throw new Error('Guardian dashboard fetch failed');
    const children = guardianDash.data.data.children;
    console.log(`  ✅ Linked Children: ${children.length} child found (${children.map(c => c.student_name).join(', ')})`);

    // 6. Report Export (CSV format)
    console.log('Step 6: CSV Attendance Export...');
    const csvExport = await request('GET', '/api/reports/attendance?class_id=4&format=csv', null, adminToken);
    if (csvExport.status !== 200 || !csvExport.raw.includes('Roll,Student ID,Name')) {
      throw new Error('CSV export failed');
    }
    console.log('  ✅ CSV Attendance Report successfully generated and downloadable.');

    console.log('\n🎉 ALL MULTI-ROLE PORTAL INTEGRATIONS VERIFIED AND OPERATIONAL!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Portal Integration Test Failed:', err.message);
    process.exit(1);
  }
})();
