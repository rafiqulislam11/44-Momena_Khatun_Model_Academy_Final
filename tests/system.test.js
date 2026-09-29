/**
 * Automated System Test Suite — Momena Khatun Model Academy
 * Validates Functional, Security, Database, and Role Access requirements
 */

const assert = require('assert');
const app = require('../backend/server');

async function runTests() {
  console.log('🚀 Starting Automated System Test Suite...\n');
  const server = app.listen(5099);
  const BASE_URL = 'http://localhost:5099';

  let adminToken = '';
  let studentToken = '';

  try {
    // 1. Healthcheck
    console.log('Test 1: System Healthcheck & DB status...');
    const rHealth = await fetch(`${BASE_URL}/api/system/health`);
    const jHealth = await rHealth.json();
    assert.strictEqual(rHealth.status, 200);
    assert.strictEqual(jHealth.database.connected, true);
    console.log('  ✅ Healthcheck passed.');

    // 2. Authentication & JWT
    console.log('Test 2: Authentication & Token Issuance...');
    const rLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
    });
    const jLogin = await rLogin.json();
    assert.strictEqual(rLogin.status, 200);
    assert.strictEqual(jLogin.success, true);
    assert.ok(jLogin.token);
    adminToken = jLogin.token;

    const rStudentLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'student.101', password: 'Student@123' })
    });
    const jStudentLogin = await rStudentLogin.json();
    studentToken = jStudentLogin.token;
    console.log('  ✅ Authentication passed for Admin and Student.');

    // 3. Security & Unauthorized Protection
    console.log('Test 3: Security & Route Protection...');
    const rNoToken = await fetch(`${BASE_URL}/api/students`);
    assert.strictEqual(rNoToken.status, 401, 'Should reject unauthenticated access');

    // Role enforcement: Student attempting to create a class
    const rStudentCreate = await fetch(`${BASE_URL}/api/academic/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ name: 'Hacked Class', code: 'HCK' })
    });
    assert.strictEqual(rStudentCreate.status, 403, 'Should reject non-admin from creating classes');
    console.log('  ✅ Security and RBAC enforcement passed.');

    // 4. Academic Data Retrieval
    console.log('Test 4: Academic Classes (Play to Class 10)...');
    const rClasses = await fetch(`${BASE_URL}/api/academic/classes`);
    const jClasses = await rClasses.json();
    assert.strictEqual(rClasses.status, 200);
    assert.ok(jClasses.data.length >= 12, 'Must support Play through Class 9 and Class 10');
    console.log(`  ✅ Academic structure passed (${jClasses.data.length} classes verified).`);

    // 5. Attendance Operations
    console.log('Test 5: Attendance Bulk Action & Summary...');
    const rAtt = await fetch(`${BASE_URL}/api/attendance/mark-all-present`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ class_id: 10, date: '2026-09-29' })
    });
    const jAtt = await rAtt.json();
    assert.strictEqual(jAtt.success, true);
    console.log('  ✅ Attendance bulk mark passed.');

    // 6. Examination, Marks & Report Card Calculation
    console.log('Test 6: Exam Marks & Auto GPA/Grade Calculation...');
    const rReport = await fetch(`${BASE_URL}/api/exams/report-card/1/1`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const jReport = await rReport.json();
    assert.strictEqual(jReport.success, true);
    assert.ok(jReport.data.summary.gpa > 0);
    assert.strictEqual(jReport.data.summary.status, 'PASSED');
    console.log(`  ✅ GPA calculation passed: GPA ${jReport.data.summary.gpa} (Grade: ${jReport.data.summary.finalGrade}).`);

    // 7. Dashboard Analytics
    console.log('Test 7: Role Dashboard Analytics...');
    const rDash = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const jDash = await rDash.json();
    assert.strictEqual(jDash.success, true);
    assert.strictEqual(jDash.role, 'ADMIN');
    assert.ok(jDash.data.metrics.totalStudents > 0);
    console.log('  ✅ Dashboard analytics passed.');

    // 8. Attendance Report Export (CSV)
    console.log('Test 8: Reports Export...');
    const rCsv = await fetch(`${BASE_URL}/api/reports/attendance?class_id=10&format=csv`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(rCsv.status, 200);
    const csvText = await rCsv.text();
    assert.ok(csvText.includes('Student ID'));
    console.log('  ✅ Report CSV generation passed.');

    console.log('\n🎉 ALL 8 AUTOMATED SYSTEM TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('\n❌ System test failed:', err);
  process.exit(1);
});
