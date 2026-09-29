/**
 * Momena Khatun Model Academy — Smart School Portal SPA Controller
 * Multi-Role Support: Super Admin, Admin, Teacher, Student, Guardian
 */

class PortalApp {
  static currentUser = null;
  static activeView = 'dashboard';
  static activeChildId = null;

  static async init() {
    this.bindEvents();

    const token = API.getToken();
    if (!token) {
      this.showLogin();
      return;
    }

    try {
      const res = await API.get('/auth/profile');
      this.currentUser = res.user;
      this.showApp();
    } catch (err) {
      console.warn('Session expired or invalid, redirecting to login');
      this.showLogin();
    }
  }

  static bindEvents() {
    // Mobile sidebar toggle and backdrop
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    document.getElementById('sidebarToggleBtn')?.addEventListener('click', () => {
      const isOpen = sidebar?.classList.toggle('open');
      backdrop?.classList.toggle('active', !!isOpen);
    });

    backdrop?.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      backdrop?.classList.remove('active');
    });

    // Login Form Submit
    document.getElementById('portalLoginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      try {
        const res = await API.post('/auth/login', { username, password });
        API.setToken(res.token);
        this.currentUser = res.user;
        Toast.success(`স্বাগতম, ${res.user.full_name}!`);
        this.showApp();
      } catch (err) {
        Toast.error(err.message || 'লগইন ব্যর্থ হয়েছে।');
      }
    });

    // Hash change routing
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigate(hash);
    });

    // Student Registration Form Submit
    document.getElementById('newStudentForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        full_name: document.getElementById('ns_name').value.trim(),
        roll_no: Number(document.getElementById('ns_roll').value),
        class_id: Number(document.getElementById('ns_class').value),
        section_id: Number(document.getElementById('ns_section').value),
        father_name: document.getElementById('ns_father').value.trim(),
        mother_name: document.getElementById('ns_mother').value.trim(),
        phone: document.getElementById('ns_phone').value.trim(),
        blood_group: document.getElementById('ns_blood').value,
        address: document.getElementById('ns_address').value.trim()
      };

      try {
        const res = await API.post('/students', payload);
        Toast.success('শিক্ষার্থী সফলভাবে নিবন্ধিত হয়েছে!');
        Modal.close('addStudentModal');
        e.target.reset();
        this.renderStudents();
      } catch (err) {
        Toast.error(err.message || 'শিক্ষার্থী নিবন্ধন ব্যর্থ হয়েছে');
      }
    });

    // Marks Entry Form Submit
    document.getElementById('marksEntryForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        exam_id: Number(document.getElementById('me_exam_id').value),
        student_id: Number(document.getElementById('me_student_id').value),
        subject_id: Number(document.getElementById('me_subject_id').value),
        written_marks: Number(document.getElementById('me_written').value),
        mcq_marks: Number(document.getElementById('me_mcq').value),
        remarks: document.getElementById('me_remarks').value.trim()
      };

      try {
        const res = await API.post('/exams/marks', payload);
        Toast.success(`নম্বর সংরক্ষিত! মোট: ${res.data.total}, গ্রেড: ${res.data.grade}`);
        Modal.close('marksEntryModal');
        this.renderExams();
      } catch (err) {
        Toast.error(err.message || 'নম্বর সংরক্ষণ ব্যর্থ হয়েছে');
      }
    });

    // Create Notice Form Submit
    document.getElementById('createNoticeForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('nt_title').value.trim(),
        category: document.getElementById('nt_category').value,
        target_audience: document.getElementById('nt_audience').value,
        description: document.getElementById('nt_description').value.trim(),
        priority: 'NORMAL'
      };

      try {
        await API.post('/notices', payload);
        Toast.success('নোটিশ সফলভাবে প্রকাশিত হয়েছে!');
        Modal.close('createNoticeModal');
        e.target.reset();
        this.renderNotices();
      } catch (err) {
        Toast.error(err.message || 'নোটিশ প্রকাশে ব্যর্থ হয়েছে');
      }
    });
  }

  static showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('portalAppShell').style.display = 'none';
  }

  static showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('portalAppShell').style.display = 'flex';

    this.renderUserInfo();
    this.renderSidebarNav();

    const hash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigate(hash);
  }

  static renderUserInfo() {
    const user = this.currentUser;
    if (!user) return;

    document.getElementById('sidebarUserName').textContent = user.full_name;
    const roleEl = document.getElementById('sidebarUserRole');
    roleEl.textContent = user.role;
    roleEl.className = `role-badge ${user.role.toLowerCase().replace(' ', '-')}`;
  }

  static renderSidebarNav() {
    const nav = document.getElementById('sidebarNav');
    const role = this.currentUser?.role;
    let items = [];

    if (role === 'SUPER ADMIN' || role === 'ADMIN') {
      items = [
        { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: '📊' },
        { id: 'students', label: 'শিক্ষার্থী ব্যবস্থাপনা', icon: '🎓' },
        { id: 'academic', label: 'একাডেমিক ও বিষয়', icon: '🏛️' },
        { id: 'attendance', label: 'উপস্থিতি রেজিস্টার', icon: '📋' },
        { id: 'exams', label: 'পরীক্ষা ও ফলাফল', icon: '📝' },
        { id: 'routines', label: 'ক্লাস ও পরীক্ষার রুটিন', icon: '📅' },
        { id: 'homework', label: 'হোমওয়ার্ক ও টাস্ক', icon: '📚' },
        { id: 'notices', label: 'নোটিশ বোর্ড', icon: '📢' },
        { id: 'reports', label: 'রিপোর্ট ও এক্সপোর্ট', icon: '📈' }
      ];
    } else if (role === 'TEACHER') {
      items = [
        { id: 'dashboard', label: 'শিক্ষক ড্যাশবোর্ড', icon: '📊' },
        { id: 'attendance', label: 'উপস্থিতি প্রদান', icon: '📋' },
        { id: 'exams', label: 'নম্বর এন্ট্রি ও ফলাফল', icon: '📝' },
        { id: 'homework', label: 'হোমওয়ার্ক ব্যবস্থাপনা', icon: '📚' },
        { id: 'routines', label: 'আমার সময়সূচি', icon: '📅' },
        { id: 'notices', label: 'প্রাতিষ্ঠানিক নোটিশ', icon: '📢' }
      ];
    } else if (role === 'STUDENT') {
      items = [
        { id: 'dashboard', label: 'শিক্ষার্থী ড্যাশবোর্ড', icon: '📊' },
        { id: 'attendance', label: 'আমার উপস্থিতি', icon: '📋' },
        { id: 'exams', label: 'ফলাফল ও মার্কশিট', icon: '📝' },
        { id: 'homework', label: 'বাড়ির কাজ (Homework)', icon: '📚' },
        { id: 'routines', label: 'আমার ক্লাস রুটিন', icon: '📅' },
        { id: 'notices', label: 'নোটিশ বোর্ড', icon: '📢' }
      ];
    } else if (role === 'GUARDIAN') {
      items = [
        { id: 'dashboard', label: 'অভিভাবক ড্যাশবোর্ড', icon: '📊' },
        { id: 'attendance', label: 'সন্তানের উপস্থিতি', icon: '📋' },
        { id: 'exams', label: 'সন্তানের ফলাফল', icon: '📝' },
        { id: 'homework', label: 'সন্তানের হোমওয়ার্ক', icon: '📚' },
        { id: 'routines', label: 'ক্লাসের রুটিন', icon: '📅' },
        { id: 'notices', label: 'নোটিশ বোর্ড', icon: '📢' }
      ];
    }

    nav.innerHTML = `
      <div class="nav-category">মূল মেনু</div>
      ${items.map(item => {
        // Defensively sanitize label to ensure no leading emojis duplicate item.icon
        const cleanLabel = (item.label || '').replace(/^[\p{Emoji}\u200d\s]+/gu, '').trim();
        return `
        <a class="sidebar-link" href="#${item.id}" data-view="${item.id}">
          <span class="sidebar-icon">${item.icon}</span>
          <span>${cleanLabel}</span>
        </a>
      `;
      }).join('')}
      <div class="nav-category" style="margin-top: 15px;">অন্যান্য</div>
      <a class="sidebar-link" href="/index.html">
        <span class="sidebar-icon">🌐</span>
        <span>স্কুল ওয়েবসাইট</span>
      </a>
    `;
  }

  static navigate(viewId) {
    this.activeView = viewId;

    // Highlight active link
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewId);
    });

    // Close mobile sidebar and backdrop
    document.getElementById('appSidebar')?.classList.remove('open');
    document.getElementById('sidebarBackdrop')?.classList.remove('active');

    // Route view rendering
    switch (viewId) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'students':
        this.renderStudents();
        break;
      case 'academic':
        this.renderAcademic();
        break;
      case 'attendance':
        this.renderAttendance();
        break;
      case 'exams':
        this.renderExams();
        break;
      case 'routines':
        this.renderRoutines();
        break;
      case 'homework':
        this.renderHomework();
        break;
      case 'notices':
        this.renderNotices();
        break;
      case 'reports':
        this.renderReports();
        break;
      default:
        this.renderDashboard();
    }
  }

  // 1. DASHBOARD VIEW
  static async renderDashboard() {
    const container = document.getElementById('portalMainContent');
    document.getElementById('pageTitle').textContent = 'ড্যাশবোর্ড ওভারভিউ';
    document.getElementById('pageSubtitle').textContent = 'মোমেনা খাতুন মডেল একাডেমি স্মার্ট প্ল্যাটফর্ম';

    container.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';

    try {
      const res = await API.get('/dashboard');
      const data = res.data;
      const role = this.currentUser.role;

      if (role === 'SUPER ADMIN' || role === 'ADMIN') {
        const m = data.metrics;
        container.innerHTML = `
          <div class="stat-card-grid">
            <div class="stat-card">
              <div class="stat-card-icon primary">🎓</div>
              <div class="stat-card-info">
                <h4>${m.totalStudents} জন</h4>
                <p>মোট সক্রিয় শিক্ষার্থী</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon success">👨‍🏫</div>
              <div class="stat-card-info">
                <h4>${m.totalTeachers} জন</h4>
                <p>শিক্ষকমণ্ডলী</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon warning">🏛️</div>
              <div class="stat-card-info">
                <h4>${m.totalClasses} টি</h4>
                <p>শ্রেণি (প্লে - ১০ম শ্রেণি)</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon danger">📋</div>
              <div class="stat-card-info">
                <h4>${m.todayAttendance.present} জন</h4>
                <p>আজকের উপস্থিত শিক্ষার্থী</p>
              </div>
            </div>
          </div>

          <div class="dashboard-grid-2-1">
            <div class="card">
              <div class="card-header">
                <span class="card-title">শ্রেণিভিত্তিক শিক্ষার্থী সংখ্যা</span>
              </div>
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr><th>শ্রেণি</th><th>শিক্ষার্থী সংখ্যা</th><th>অবস্থা</th></tr>
                  </thead>
                  <tbody>
                    ${data.classDistribution.slice(0, 8).map(c => `
                      <tr>
                        <td><b>${c.name}</b></td>
                        <td>${c.student_count} জন</td>
                        <td><span class="badge badge-success">সক্রিয়</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <span class="card-title">সাম্প্রতিক নোটিশ</span>
              </div>
              <div style="display: grid; gap: 10px;">
                ${data.activeNotices.map(n => `
                  <div style="padding: 10px; background: var(--bg-muted); border-radius: 8px;">
                    <b style="font-size: 13px; color: var(--text-primary);">${n.title}</b>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">📅 ${n.publish_date}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      } else if (role === 'TEACHER') {
        container.innerHTML = `
          <div class="stat-card-grid">
            <div class="stat-card">
              <div class="stat-card-icon primary">📚</div>
              <div class="stat-card-info">
                <h4>${data.assignments.length} টি</h4>
                <p>বরাদ্দকৃত বিষয় ও ক্লাস</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon warning">📝</div>
              <div class="stat-card-info">
                <h4>${data.myHomework.length} টি</h4>
                <p>সক্রিয় হোমওয়ার্ক অ্যাসাইনমেন্ট</p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-title">আমার দায়িত্বপ্রাপ্ত ক্লাস ও বিষয়সমূহ</span>
            </div>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr><th>শ্রেণি</th><th>শাখা</th><th>বিষয়</th><th>ক্লাস টিচার?</th><th>অ্যাকশন</th></tr>
                </thead>
                <tbody>
                  ${data.assignments.map(a => `
                    <tr>
                      <td><b>${a.class_name}</b></td>
                      <td>${a.section_name}</td>
                      <td>${a.subject_name}</td>
                      <td>${a.is_class_teacher ? '<span class="badge badge-success">হ্যাঁ</span>' : 'না'}</td>
                      <td><a class="btn btn-outline btn-sm" href="#attendance">উপস্থিতি নিন</a></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (role === 'STUDENT') {
        const s = data.student;
        const att = data.attendanceSummary;
        container.innerHTML = `
          <div class="card" style="margin-bottom: 20px; background: linear-gradient(135deg, var(--primary-800), var(--primary-700)); color: #fff;">
            <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
              <div style="width: 70px; height: 70px; border-radius: 50%; background: #fff; color: var(--primary-700); display: grid; place-items: center; font-size: 32px; font-weight: 800;">
                🎓
              </div>
              <div>
                <h3 style="font-size: 22px; color: #fff;">${s.student_name}</h3>
                <p style="color: #cbd5e1; font-size: 14px;">আইডি: <b>${s.student_id_code}</b> | শ্রেণি: <b>${s.class_name} (${s.section_name || 'ক'})</b> | রোল: <b>${s.roll_no}</b></p>
              </div>
            </div>
          </div>

          <div class="stat-card-grid">
            <div class="stat-card">
              <div class="stat-card-icon success">📊</div>
              <div class="stat-card-info">
                <h4>${att.rate || 100}%</h4>
                <p>উপস্থিতির হার</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon primary">🏆</div>
              <div class="stat-card-info">
                <h4>৫.০০ (A+)</h4>
                <p>সর্বশেষ পরীক্ষার জিপিএ</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon warning">📚</div>
              <div class="stat-card-info">
                <h4>${data.pendingHomework.length} টি</h4>
                <p>চলমান হোমওয়ার্ক</p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-title">সর্বশেষ পরীক্ষার বিষয়ভিত্তিক ফলাফল</span>
            </div>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr><th>বিষয়</th><th>মোট নম্বর</th><th>গ্রেড</th><th>জিপিএ</th><th>শিক্ষকের মন্তব্য</th></tr>
                </thead>
                <tbody>
                  ${data.latestResults.map(r => `
                    <tr>
                      <td><b>${r.subject_name}</b></td>
                      <td>${r.total_marks}</td>
                      <td><span class="badge badge-success">${r.grade}</span></td>
                      <td><b>${r.grade_point.toFixed(2)}</b></td>
                      <td>${r.remarks || 'খুব ভালো'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (role === 'GUARDIAN') {
        const children = data.children;
        const currentChild = children.find(c => c.id === this.activeChildId) || children[0];
        if (currentChild) this.activeChildId = currentChild.id;

        container.innerHTML = `
          <!-- Child Switcher -->
          <div class="child-switcher-bar">
            <b style="font-size: 13px;">👨‍👩‍👦 সন্তান নির্বাচন করুন:</b>
            <div style="display: flex; gap: 8px;">
              ${children.map(c => `
                <button class="child-pill ${c.id === this.activeChildId ? 'active' : ''}" onclick="PortalApp.switchChild(${c.id})">
                  ${c.student_name} (${c.class_name})
                </button>
              `).join('')}
            </div>
          </div>

          ${currentChild ? `
            <div class="card" style="margin-bottom: 20px;">
              <h3 style="font-size: 18px; color: var(--primary-700); margin-bottom: 6px;">${currentChild.student_name} এর অ্যাকাডেমিক অগ্রগতি</h3>
              <p style="font-size: 13px; color: var(--text-secondary);">শিক্ষার্থী আইডি: <b>${currentChild.student_id_code}</b> | শ্রেণি: <b>${currentChild.class_name}</b> | রোল: <b>${currentChild.roll_no}</b></p>
            </div>

            <div class="stat-card-grid">
              <div class="stat-card">
                <div class="stat-card-icon success">📋</div>
                <div class="stat-card-info">
                  <h4>১০০%</h4>
                  <p>বর্তমান উপস্থিতি</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-card-icon primary">🏆</div>
                <div class="stat-card-info">
                  <h4>A+ (GPA 5.0)</h4>
                  <p>১ম সাময়িক মূল্যায়ন</p>
                </div>
              </div>
            </div>
          ` : '<p>কোনো সন্তান লিংক করা নেই</p>'}
        `;
      }
    } catch (err) {
      container.innerHTML = `<div class="card"><p style="color: red;">ড্যাশবোর্ড তথ্য লোড ব্যর্থ হয়েছে: ${err.message}</p></div>`;
    }
  }

  static switchChild(childId) {
    this.activeChildId = childId;
    this.renderDashboard();
  }

  // 2. STUDENTS MANAGEMENT VIEW
  static async renderStudents() {
    const container = document.getElementById('portalMainContent');
    document.getElementById('pageTitle').textContent = 'শিক্ষার্থী ব্যবস্থাপনা';
    document.getElementById('pageSubtitle').textContent = 'সকল শ্রেণির শিক্ষার্থীদের তালিকা ও ভর্তি তথ্য';

    container.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';

    try {
      const [studentsRes, classesRes] = await Promise.all([
        API.get('/students'),
        API.get('/academic/classes')
      ]);

      const students = studentsRes.data;
      const classes = classesRes.data;

      // Populate class select in modal
      const classSelect = document.getElementById('ns_class');
      if (classSelect) {
        classSelect.innerHTML = classes.map(c => `<option value="${c.id}">${c.name} (${c.name_bn})</option>`).join('');
      }

      container.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="text" id="studentSearchInput" class="form-control" placeholder="🔍 শিক্ষার্থী খুঁজুন..." style="width: 250px;">
            </div>
            ${['SUPER ADMIN', 'ADMIN'].includes(this.currentUser.role) ? `
              <button class="btn btn-primary" onclick="Modal.open('addStudentModal')">➕ নতুন শিক্ষার্থী ভর্তি করুন</button>
            ` : ''}
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>আইডি</th>
                  <th>রোল</th>
                  <th>নাম</th>
                  <th>শ্রেণি</th>
                  <th>শাখা</th>
                  <th>পিতার নাম</th>
                  <th>মোবাইল</th>
                  <th>অবস্থা</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody id="studentTableBody">
                ${students.map(s => `
                  <tr>
                    <td><b>${s.student_id_code}</b></td>
                    <td>${s.roll_no}</td>
                    <td><b>${s.full_name}</b></td>
                    <td>${s.class_name}</td>
                    <td>${s.section_name || 'ক'}</td>
                    <td>${s.father_name || '-'}</td>
                    <td>${s.phone || '-'}</td>
                    <td><span class="badge badge-success">${s.status}</span></td>
                    <td>
                      <button class="btn btn-outline btn-sm" onclick="PortalApp.viewStudentTranscript(${s.id})">মার্কশিট</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Live search filter
      document.getElementById('studentSearchInput')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('#studentTableBody tr').forEach(row => {
          row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
      });
    } catch (err) {
      container.innerHTML = `<p style="color: red;">শিক্ষার্থীদের তথ্য লোড ব্যর্থ: ${err.message}</p>`;
    }
  }

  // 3. ACADEMIC STRUCTURE VIEW
  static async renderAcademic() {
    const container = document.getElementById('portalMainContent');
    document.getElementById('pageTitle').textContent = 'একাডেমিক কাঠামো ও শ্রেণিসমূহ';
    document.getElementById('pageSubtitle').textContent = 'প্লে থেকে ১০ম শ্রেণি পর্যন্ত কারিকুলাম ও বিষয় ব্যবস্থাপনা';

    container.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';

    try {
      const res = await API.get('/academic/classes');
      const classes = res.data;

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px;">
          ${classes.map(c => `
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <b style="font-size: 18px; color: var(--primary-700);">${c.name} (${c.name_bn})</b>
                <span class="badge badge-primary">লেভেল ${c.numeric_level}</span>
              </div>
              <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">শাখা: <b>${c.sections.map(s => s.name).join(', ') || 'ক'}</b></p>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 8px;">
                <span>শিক্ষার্থী: <b>${c.total_students} জন</b></span>
                <span>মোট বিষয়: <b>${c.total_subjects} টি</b></span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: red;">একাডেমিক তথ্য লোড ব্যর্থ: ${err.message}</p>`;
    }
  }

  // 4. ATTENDANCE MANAGEMENT VIEW
  static async renderAttendance() {
    const container = document.getElementById('portalMainContent');
    document.getElementById('pageTitle').textContent = 'উপস্থিতি খাতা ও ব্যবস্থাপনা';
    document.getElementById('pageSubtitle').textContent = 'দৈনিক উপস্থিতি গ্রহণ ও হাজিরা রেকর্ড';

    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div class="card" style="margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end;">
          <div class="form-group" style="margin: 0; min-width: 180px;">
            <label>শ্রেণি নির্বাচন</label>
            <select id="att_classSelect" class="form-control">
              <option value="10">Class 7 (৭ম শ্রেণি)</option>
              <option value="8">Class 5 (৫ম শ্রেণি)</option>
              <option value="1">Play (প্লে)</option>
              <option value="4">Class 1 (১ম শ্রেণি)</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label>তারিখ</label>
            <input type="date" id="att_dateInput" class="form-control" value="${todayStr}">
          </div>
          <button class="btn btn-navy" onclick="PortalApp.loadClassAttendance()">হাজিরা লোড করুন</button>
          ${['SUPER ADMIN', 'ADMIN', 'TEACHER'].includes(this.currentUser.role) ? `
            <button class="btn btn-success" onclick="PortalApp.markAllPresent()">⚡ সকলকে উপস্থিত করুন</button>
            <button class="btn btn-primary" onclick="PortalApp.saveAttendance()">💾 হাজিরা সংরক্ষণ করুন</button>
          ` : ''}
        </div>
      </div>

      <div id="attendanceGridArea">
        <div class="spinner" style="margin: 30px auto;"></div>
      </div>
    `;

    this.loadClassAttendance();
  }

  static async loadClassAttendance() {
    const classId = document.getElementById('att_classSelect')?.value || 10;
    const date = document.getElementById('att_dateInput')?.value || new Date().toISOString().split('T')[0];
    const area = document.getElementById('attendanceGridArea');

    try {
      const res = await API.get('/attendance/class', { class_id: classId, date });
      const data = res.data;

      area.innerHTML = `
        <div class="card" style="margin-bottom: 16px; background: var(--bg-muted);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 14px;">
            <span>তারিখ: <b>${data.date}</b></span>
            <span>মোট: <b>${data.summary.total} জন</b></span>
            <span style="color: var(--success);">উপস্থিত: <b>${data.summary.present}</b></span>
            <span style="color: var(--danger);">অনুপস্থিত: <b>${data.summary.absent}</b></span>
            <span style="color: var(--warning);">দেরি: <b>${data.summary.late}</b></span>
            <span style="color: var(--info);">ছুটি: <b>${data.summary.leave}</b></span>
            <span>উপস্থিতির হার: <b>${data.summary.percentage}%</b></span>
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>রোল</th>
                  <th>আইডি</th>
                  <th>শিক্ষার্থীর নাম</th>
                  <th>উপস্থিতি স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody id="attTableRows">
                ${data.students.map(s => `
                  <tr data-student-id="${s.student_id}">
                    <td><b>${s.roll_no}</b></td>
                    <td>${s.student_id_code}</td>
                    <td><b>${s.student_name}</b></td>
                    <td>
                      <div class="attendance-status-selector">
                        <button type="button" class="att-btn present ${s.status === 'PRESENT' ? 'active' : ''}" onclick="PortalApp.selectAtt(this, 'PRESENT')">উপস্থিত</button>
                        <button type="button" class="att-btn absent ${s.status === 'ABSENT' ? 'active' : ''}" onclick="PortalApp.selectAtt(this, 'ABSENT')">অনুপস্থিত</button>
                        <button type="button" class="att-btn late ${s.status === 'LATE' ? 'active' : ''}" onclick="PortalApp.selectAtt(this, 'LATE')">দেরি</button>
                        <button type="button" class="att-btn leave ${s.status === 'LEAVE' ? 'active' : ''}" onclick="PortalApp.selectAtt(this, 'LEAVE')">ছুটি</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      area.innerHTML = `<p style="color: red;">হাজিরা রেকর্ড লোড করা যায়নি: ${err.message}</p>`;
    }
  }

  static selectAtt(btn, status) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.att-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  static async markAllPresent() {
    const classId = document.getElementById('att_classSelect').value;
    const date = document.getElementById('att_dateInput').value;

    try {
      await API.post('/attendance/mark-all-present', { class_id: classId, date });
      Toast.success('সকল শিক্ষার্থীকে উপস্থিত হিসেবে চিহ্নিত করা হয়েছে');
      this.loadClassAttendance();
    } catch (err) {
      Toast.error(err.message || 'ব্যর্থ হয়েছে');
    }
  }

  static async saveAttendance() {
    const classId = document.getElementById('att_classSelect').value;
    const date = document.getElementById('att_dateInput').value;

    const records = [];
    document.querySelectorAll('#attTableRows tr').forEach(row => {
      const studentId = Number(row.dataset.studentId);
      const activeBtn = row.querySelector('.att-btn.active');
      let status = 'PRESENT';
      if (activeBtn?.classList.contains('absent')) status = 'ABSENT';
      else if (activeBtn?.classList.contains('late')) status = 'LATE';
      else if (activeBtn?.classList.contains('leave')) status = 'LEAVE';

      records.push({ student_id: studentId, status });
    });

    try {
      await API.post('/attendance/mark', { class_id: classId, date, records });
      Toast.success('হাজিরা তথ্য ডাটাবেজে সংরক্ষিত হয়েছে!');
      this.loadClassAttendance();
    } catch (err) {
      Toast.error(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    }
  }

  // 5. EXAMINATIONS & RESULT VIEW
  static async renderExams() {
    const container = document.getElementById('portalMainContent');
    document.getElementById('pageTitle').textContent = 'পরীক্ষা ও ফলাফল বিবরণী';
    document.getElementById('pageSubtitle').textContent = 'নম্বর এন্ট্রি, জিপিএ মূল্যায়ন ও মার্কশিট জেনারেটর';

    container.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';

    try {
      const [examsRes, studentsRes, subjectsRes] = await Promise.all([
        API.get('/exams'),
        API.get('/students'),
        API.get('/academic/subjects')
      ]);

      const exams = examsRes.data;
      const students = studentsRes.data;
      const subjects = subjectsRes.data;

      // Populate modal subjects
      const subSelect = document.getElementById('me_subject_id');
      if (subSelect) {
        subSelect.innerHTML = subjects.map(s => `<option value="${s.id}">${s.name} (${s.name_bn || s.code})</option>`).join('');
      }

      container.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 12px; color: var(--primary-700);">পরীক্ষার তালিকা</h3>
          <div style="display: flex; gap: 14px; flex-wrap: wrap;">
            ${exams.map(e => `
              <div style="background: var(--bg-muted); padding: 12px 18px; border-radius: 8px; border: 1px solid var(--border-color);">
                <b>${e.name}</b>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">অংশগ্রহণকারী: ${e.participants_count} জন</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">শিক্ষার্থী ও ফলাফল তালিকা</span>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>রোল</th>
                  <th>আইডি</th>
                  <th>শিক্ষার্থীর নাম</th>
                  <th>শ্রেণি</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                ${students.map(s => `
                  <tr>
                    <td><b>${s.roll_no}</b></td>
                    <td>${s.student_id_code}</td>
                    <td><b>${s.full_name}</b></td>
                    <td>${s.class_name}</td>
                    <td>
                      <button class="btn btn-navy btn-sm" onclick="PortalApp.openMarksModal(${s.id}, '${s.full_name}')">➕ নম্বর এন্ট্রি</button>
                      <button class="btn btn-outline btn-sm" onclick="PortalApp.viewStudentTranscript(${s.id})">📄 মার্কশিট দেখুন</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: red;">ফলাফল তথ্য লোড করা যায়নি: ${err.message}</p>`;
    }
  }

  static openMarksModal(studentId, studentName) {
    document.getElementById('me_exam_id').value = 1;
    document.getElementById('me_student_id').value = studentId;
    document.getElementById('me_student_info').textContent = `শিক্ষার্থী: ${studentName}`;
    Modal.open('marksEntryModal');
  }

  static async viewStudentTranscript(studentId) {
    const modalBody = document.getElementById('reportCardModalBody');
    modalBody.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';
    Modal.open('reportCardModal');

    try {
      const res = await API.get(`/exams/report-card/${studentId}/1`);
      const { student, exam, marks, summary } = res.data;

      modalBody.innerHTML = `
        <div class="report-card-container">
          <div class="report-card-header">
            <img src="assets/logo.png" alt="Logo">
            <h2>মোমেনা খাতুন মডেল একাডেমি</h2>
            <p>জামিরদিয়া, হবিরবাড়ী-২২৪০, ভালুকা, ময়মনসিংহ | ফোন: ০১৭৭১-৯০৭৪৭৪</p>
            <div class="report-title-badge">${exam.name} — একাডেমিক মার্কশিট</div>
          </div>

          <div class="report-student-meta">
            <p><strong>শিক্ষার্থীর নাম:</strong> ${student.student_name}</p>
            <p><strong>শিক্ষার্থী আইডি:</strong> ${student.student_id_code}</p>
            <p><strong>শ্রেণি:</strong> ${student.class_name} (${student.section_name || 'শাখা ক'})</p>
            <p><strong>রোল নম্বর:</strong> ${student.roll_no}</p>
            <p><strong>পিতার নাম:</strong> ${student.father_name || '-'}</p>
            <p><strong>শিক্ষাবর্ষ:</strong> ২০২৬</p>
          </div>

          <div class="table-responsive">
            <table class="data-table" style="border: 1px solid #cbd5e1;">
              <thead>
                <tr>
                  <th>বিষয় কোড</th>
                  <th>বিষয়ের নাম</th>
                  <th>পূর্ণমান</th>
                  <th>প্রাপ্ত নম্বর</th>
                  <th>লেটার গ্রেড</th>
                  <th>গ্রেড পয়েন্ট</th>
                  <th>মন্তব্য</th>
                </tr>
              </thead>
              <tbody>
                ${marks.map(m => `
                  <tr>
                    <td>${m.subject_code}</td>
                    <td><b>${m.subject_name_bn || m.subject_name}</b></td>
                    <td>${m.full_marks}</td>
                    <td><b>${m.total_marks}</b></td>
                    <td><span class="badge badge-success">${m.grade}</span></td>
                    <td>${m.grade_point.toFixed(2)}</td>
                    <td>${m.remarks || 'উত্তম'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="report-summary-box">
            <div>
              <b>${summary.grandTotal} / ${summary.maxGrandTotal}</b>
              <small>মোট প্রাপ্ত নম্বর</small>
            </div>
            <div>
              <b>${summary.percentage}%</b>
              <small>শতাংশ</small>
            </div>
            <div>
              <b style="color: var(--primary-700);">${summary.gpa.toFixed(2)}</b>
              <small>জিপিএ (GPA)</small>
            </div>
            <div>
              <b style="color: var(--success);">${summary.finalGrade} (${summary.status === 'PASSED' ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'})</b>
              <small>চূড়ান্ত মূল্যায়ন</small>
            </div>
          </div>

          <div class="report-signatures">
            <div class="sig-line">শ্রেণি শিক্ষকের স্বাক্ষর</div>
            <div class="sig-line">অভিভাবকের স্বাক্ষর</div>
            <div class="sig-line">প্রধান শিক্ষক / পরিচালক</div>
          </div>
        </div>
      `;
    } catch (err) {
      modalBody.innerHTML = `<p style="color: red;">মার্কশিট লোড করা যায়নি: ${err.message}</p>`;
    }
  }

  // 6. ROUTINES & TIMETABLE VIEW
  static async renderRoutines() {
    const container = document.getElementById('portalMainContent');
    document.getElementById('pageTitle').textContent = 'ক্লাস ও পরীক্ষার রুটিন';
    document.getElementById('pageSubtitle').textContent = 'সাপ্তাহিক ক্লাস সময়সূচি ও পিরিয়ড বিভাজন';

    container.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';

    try {
      const res = await API.get('/routines/class', { class_id: 10 });
      const routines = res.data;

      container.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
          <b style="color: var(--primary-700);">৭ম শ্রেণির প্রাত্যহিক ক্লাস রুটিন (শনিবার - বৃহস্পতিবার)</b>
        </div>

        <div class="timetable-grid">
          ${['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'].map(day => {
            const dayRoutines = routines.filter(r => r.day === day);
            return `
              <div class="timetable-day-card">
                <div class="timetable-day-title">${day === 'SATURDAY' ? 'শনিবার' : (day === 'SUNDAY' ? 'রবিবার' : day)}</div>
                <div class="timetable-periods">
                  ${dayRoutines.length > 0 ? dayRoutines.map(r => `
                    <div class="timetable-period-box">
                      <b>${r.subject_name}</b>
                      <span>${r.start_time} - ${r.end_time}</span>
                      <small style="display: block; color: var(--text-secondary); margin-top: 4px;">👨‍🏫 ${r.teacher_name || 'শিক্ষক'}</small>
                    </div>
                  `).join('') : `
                    <div class="timetable-period-box">
                      <b>বাংলা ও ইংরেজি</b>
                      <span>০৯:০০ - ১০:৩০</span>
                      <small style="display: block; color: var(--text-secondary);">শ্রেণিকক্ষ ১০১</small>
                    </div>
                    <div class="timetable-period-box">
                      <b>গণিত ও বিজ্ঞান</b>
                      <span>১০:৩০ - ১২:০০</span>
                      <small style="display: block; color: var(--text-secondary);">শ্রেণিকক্ষ ১০১</small>
                    </div>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: red;">রুটিন লোড ব্যর্থ: ${err.message}</p>`;
    }
  }

  // 7. HOMEWORK & ASSIGNMENTS VIEW
  static async renderHomework() {
    const container = document.getElementById('portalMainContent');
    document.getElementById('pageTitle').textContent = 'হোমওয়ার্ক ও অ্যাসাইনমেন্ট';
    document.getElementById('pageSubtitle').textContent = 'দৈনিক বাড়ির কাজ প্রদান ও জমা দেওয়ার অবস্থা';

    container.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';

    try {
      const res = await API.get('/homework');
      const homeworks = res.data;

      container.innerHTML = `
        <div style="display: grid; gap: 16px;">
          ${homeworks.map(h => `
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                  <span class="badge badge-primary">${h.class_name} — ${h.subject_name}</span>
                  <h3 style="font-size: 18px; margin: 6px 0; color: var(--primary-700);">${h.title}</h3>
                </div>
                <small style="color: var(--danger); font-weight: 700;">জমা দেওয়ার শেষ সময়: 📅 ${h.due_date}</small>
              </div>
              <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 14px;">${h.description}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 10px; font-size: 13px;">
                <span>শিক্ষক: <b>${h.teacher_name}</b></span>
                <span>মোট জমাদান: <b>${h.total_submissions} জন</b></span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: red;">হোমওয়ার্ক তথ্য লোড ব্যর্থ: ${err.message}</p>`;
    }
  }

  // 8. NOTICES VIEW
  static async renderNotices() {
    const container = document.getElementById('portalMainContent');
    document.getElementById('pageTitle').textContent = 'নোটিশ ও সার্কুলার';
    document.getElementById('pageSubtitle').textContent = 'প্রাতিষ্ঠানিক ঘোষণা ও বিজ্ঞপ্তি ব্যবস্থাপনা';

    container.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';

    try {
      const res = await API.get('/notices');
      const notices = res.data;

      container.innerHTML = `
        ${['SUPER ADMIN', 'ADMIN'].includes(this.currentUser.role) ? `
          <div class="card" style="margin-bottom: 20px;">
            <button class="btn btn-primary" onclick="Modal.open('createNoticeModal')">📢 নতুন নোটিশ তৈরি করুন</button>
          </div>
        ` : ''}

        <div style="display: grid; gap: 14px;">
          ${notices.map(n => `
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <span class="badge badge-info">${n.category}</span>
                <small style="color: var(--text-secondary);">📅 ${n.publish_date}</small>
              </div>
              <h3 style="font-size: 18px; margin-bottom: 8px; color: var(--primary-700);">${n.title}</h3>
              <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">${n.description}</p>
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: red;">নোটিশ লোড ব্যর্থ: ${err.message}</p>`;
    }
  }

  // 9. REPORTS & EXPORTS VIEW
  static async renderReports() {
    const container = document.getElementById('portalMainContent');
    document.getElementById('pageTitle').textContent = 'রিপোর্ট ও অ্যানালিটিক্স';
    document.getElementById('pageSubtitle').textContent = 'মাসিক হাজিরা বিবরণী ও এক্সপোর্ট';

    container.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';

    try {
      const res = await API.get('/reports/attendance', { class_id: 10 });
      const data = res.data;

      container.innerHTML = `
        <div class="card" style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <b style="font-size: 16px; color: var(--primary-700);">৭ম শ্রেণির মাসিক হাজিরা রিপোর্ট (${data.month})</b>
            <div style="display: flex; gap: 10px;">
              <a class="btn btn-navy btn-sm" href="/api/reports/attendance?class_id=10&format=csv">📥 CSV ডাউনলোড</a>
              <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ প্রিন্ট রিপোর্ট</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>রোল</th>
                  <th>আইডি</th>
                  <th>নাম</th>
                  <th>মোট কর্মদিবস</th>
                  <th>উপস্থিত</th>
                  <th>অনুপস্থিত</th>
                  <th>দেরি</th>
                  <th>ছুটি</th>
                  <th>শতকরা হার</th>
                </tr>
              </thead>
              <tbody>
                ${data.report.map(r => `
                  <tr>
                    <td><b>${r.roll_no}</b></td>
                    <td>${r.student_id_code}</td>
                    <td><b>${r.student_name}</b></td>
                    <td>${r.totalDays} দিন</td>
                    <td style="color: var(--success); font-weight: 700;">${r.present}</td>
                    <td style="color: var(--danger); font-weight: 700;">${r.absent}</td>
                    <td style="color: var(--warning);">${r.late}</td>
                    <td>${r.leave}</td>
                    <td><b>${r.percentage}%</b></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<p style="color: red;">রিপোর্ট লোড ব্যর্থ: ${err.message}</p>`;
    }
  }

  static logout() {
    API.post('/auth/logout', {}).catch(() => {});
    API.setToken(null);
    this.currentUser = null;
    Toast.info('সফলভাবে লগআউট হয়েছেন');
    this.showLogin();
  }
}

// 1-Click Quick Demo Login Helper
window.quickFillLogin = function(username, password) {
  document.getElementById('loginUsername').value = username;
  document.getElementById('loginPassword').value = password;
  document.getElementById('portalLoginForm').dispatchEvent(new Event('submit'));
};

window.PortalApp = PortalApp;

document.addEventListener('DOMContentLoaded', () => {
  PortalApp.init();

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.update();
    }).catch(err => {
      console.log('SW registration note:', err);
    });
  }
});
