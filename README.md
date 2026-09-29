# 🎓 Momena Khatun Model Academy — Smart School Management Platform
### মোমেনা খাতুন মডেল একাডেমি — পূর্ণাঙ্গ ও আধুনিক স্মার্ট স্কুল ম্যানেজমেন্ট সিস্টেম
> **ESTABLISHED: 2019** | Jamirdia, Hobirbari-2240, Bhaluka, Mymensingh  
> **Contact / WhatsApp:** 01771-907474  
> **Platform Version:** 1.0.0 (Production-Ready)

---

## 🌟 Executive Overview
This project is an enterprise-grade, full-stack educational portal and institutional management system built specifically for **Momena Khatun Model Academy**. It integrates a **high-converting, responsive public school website** with an **authenticated multi-role ERP Smart School Management Platform** covering 5 distinct user roles:

1. **SUPER ADMIN** (Founder / Managing Director — মোঃ সাদমান হোসাইন সাকিব)
2. **ADMIN** (Head Teacher / Academic Administration)
3. **TEACHER** (Class Teacher / Subject Teachers)
4. **STUDENT** (Enrolled Students from Play to Class 10)
5. **GUARDIAN** (Parents with Multi-Child Switching)

---

## 🏛️ System Architecture

```
/
├── backend/
│   ├── config/
│   │   ├── db.js              # Native SQLite connection & schema bootstrapper
│   │   └── env.js             # Environment parser & defaults
│   ├── controllers/
│   │   ├── academicController.js   # Classes, sections, subjects, assignments
│   │   ├── attendanceController.js # Present/Absent/Late/Leave, bulk actions
│   │   ├── authController.js       # JWT login, profile, password management
│   │   ├── dashboardController.js  # Role-specific smart analytics
│   │   ├── examController.js       # Exam creation, marks, auto GPA & report cards
│   │   ├── homeworkController.js   # Homework creation & submission
│   │   ├── noticeController.js     # Category & audience-targeted notices
│   │   ├── reportController.js     # Analytics, attendance grids & CSV export
│   │   ├── routineController.js    # Class & exam timetables
│   │   ├── studentController.js    # Student enrollment & guardian multi-child
│   │   └── systemController.js     # Healthchecks & system metadata
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & RBAC role enforcement
│   │   ├── errorHandler.js    # Standardized JSON error response handler
│   │   ├── logger.js          # Request logger with durations & IPs
│   │   └── validator.js       # Request payload validation & sanitization
│   ├── routes/
│   │   ├── academicRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── examRoutes.js
│   │   ├── homeworkRoutes.js
│   │   ├── noticeRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── routineRoutes.js
│   │   ├── studentRoutes.js
│   │   └── systemRoutes.js
│   └── server.js              # Express 5 application entry point
├── database/
│   ├── schema.sql             # Complete relational schema (18 tables, indexes)
│   ├── seed.js                # Realistic demo dataset for all classes & roles
│   └── momena_academy.db      # SQLite relational database
├── frontend/
│   ├── assets/                # School logo, director greeting poster, campus photos
│   ├── css/
│   │   ├── variables.css      # Dark/Light tokens & Bangla typography
│   │   ├── layout.css         # Responsive shell, sidebar, mobile navigation
│   │   ├── components.css     # Buttons, badges, tables, modals, loaders
│   │   ├── portal.css         # Role-specific dashboards, timetable, transcripts
│   │   └── public.css         # Public school website styling
│   ├── js/
│   │   ├── api.js             # Centralized fetch wrapper with auto auth header
│   │   ├── components.js      # Toast notifications & modal controllers
│   │   ├── i18n.js            # Bangla / English bilingual architecture
│   │   ├── portal.js          # Unified SPA Portal controller for all roles
│   │   ├── public.js          # Public website interactions, admission modal, lightbox
│   │   └── theme.js           # Light / Dark mode switcher with persistence
│   ├── index.html             # Public School Website (SEO optimized, PWA ready)
│   ├── portal.html            # Smart School Management Platform SPA
│   ├── manifest.json          # PWA Web App Manifest
│   └── sw.js                  # PWA Service Worker for offline support
├── tests/
│   └── system.test.js         # Automated 8-point end-to-end test suite
├── .env.example
├── package.json
└── README.md
```

---

## ⚡ Quick Start & Running the Project

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24.19.0)
- **npm** (included with Node.js)

### 2. Installation
```bash
# Clone or navigate to the directory
cd 43-Momena_Khatun_Model_Academy

# Install dependencies
npm install
```

### 3. Database Initialization & Seeding
```bash
# Run the database seeder to create realistic demo data
node database/seed.js
```

### 4. Running the Server
```bash
# Start the production server
node backend/server.js
```
The server will boot at: **`http://localhost:5000`**

- **Public School Website:** `http://localhost:5000/` or `http://localhost:5000/index.html`
- **Smart School Portal:** `http://localhost:5000/portal.html`
- **API Health Check:** `http://localhost:5000/api/system/health`

### 5. Running Automated Test Suite
```bash
node tests/system.test.js
```

---

## 🔑 Demo Login Credentials

For demonstration and testing purposes, pre-configured accounts are provided for every role:

| Role | Username | Password | Features / Responsibilities |
| :--- | :--- | :--- | :--- |
| **SUPER ADMIN** | `superadmin` | `Admin@123` | Full access, institutional governance, user audit logs |
| **ADMIN** | `admin` | `Admin@123` | Student admissions, classes, exams, notices, reports |
| **TEACHER** | `teacher.math` | `Teacher@123` | Class attendance, marks entry, homework assignment |
| **STUDENT** | `student.101` | `Student@123` | Student profile, personal attendance %, GPA transcript, homework |
| **GUARDIAN** | `guardian.rofiq` | `Guardian@123` | Multi-child switcher, children attendance & report cards |

> **Note:** On the portal login page (`portal.html`), you can also simply click any of the **Quick Demo Pills** to fill and test any role instantly with 1 click!

---

## 📦 Delivered Features by Phase

### Phase 0: Architecture & Foundation
- Environment configuration with `.env` and `.env.example`.
- Native SQLite database connection (`node:sqlite` DatabaseSync) with foreign keys, WAL mode, and ACID transactions.
- Unified error handler and structured request logging.
- Reusable UI component system (Toasts, Modals, Skeleton Loaders, StatCards).
- Light / Dark theme system with instant local storage persistence.
- Bangla / English (`i18n.js`) translation dictionary and toggle.

### Phase 1: Public School Website
- **Hero Section:** Established in 2019, verified institutional trust badges, stats bar.
- **Managing Director Message:** Featured portrait of **মোঃ সাদমান হোসাইন সাকিব (এম.এ)**.
- **Academic Programs:** Play through Class 9 (Class 10 ready) with curriculum highlights.
- **Interactive Admissions:** Online application modal producing instant printable receipt slips (`MKMA-2026-XXXX`) and direct WhatsApp forwarding.
- **Real Photo Gallery:** 10+ authentic campus and prize distribution photos with categorized filter tabs and full keyboard-navigable Lightbox (Previous/Next/Esc).
- **Routines & Schedules:** Class and Exam routine modal previews.
- **Events & FAQ:** Upcoming events cards and guardian FAQ accordion.
- **Contact & Map:** 1-click calling to `01771-907474`, WhatsApp integration, and interactive Google Map of Jamirdia, Bhaluka.

### Phase 2: Authentication & Role-Based Access Control (RBAC)
- Secure password hashing using `bcryptjs` (salt rounds: 10).
- JWT token issuance with expiry and signature verification.
- Route protection middleware (`requireAuth`) and role restrictions (`requireRole`).
- Comprehensive audit logging recording who changed what and when.

### Phase 3 & 4: Academic Structure & Student/Guardian Management
- Full class hierarchy: Play, Nursery, KG, Class 1 to Class 10.
- Section management (Section A, Section B) with capacities and room assignments.
- Subject catalogues with pass marks and full marks.
- Student profiles containing student IDs, rolls, blood groups, guardian links, and addresses.
- Guardian multi-child switcher allowing parents to toggle between multiple enrolled siblings.

### Phase 5: Attendance Management
- Real-time roster marking: **Present**, **Absent**, **Late**, **Leave**.
- 1-click **"Mark All Present"** bulk shortcut.
- Prevention of duplicate records via database unique constraints.
- Attendance percentage calculation and monthly student calendar records.

### Phase 6: Examination & Results Management
- Exam types: First Term, Second Term, Annual, Model Test.
- Marks breakdown: Written, MCQ, Practical, Total Marks.
- Automatic GPA calculation (5.0, 4.0, 3.5, 3.0, 2.0, 1.0, 0.0) and letter grades (A+, A, A-, B, C, D, F).
- Official printable **Academic Transcript / Report Card** modal with institutional crest, signatures, subject breakdown, and total percentage.

### Phase 7 & 8: Notices & Routines
- Notice categorization (General, Academic, Examination, Holiday, Admission, Event).
- Audience targeting: Public (Everyone), Students, Guardians, Teachers.
- Weekly digitized class timetables (Saturday to Thursday) with periods, subjects, teachers, and rooms.

### Phase 9: Homework & Digital Assignments
- Teachers can assign homework with due dates and descriptions.
- Students can view and submit assignments.
- Submission tracking: `SUBMITTED`, `LATE`, `REVIEWED` with teacher feedback.

### Phase 10 & 11: Dashboards, Analytics & Reports
- Customized smart dashboard for each role.
- Monthly attendance grid with **CSV Export** for record keeping.
- Printable report views.

### Phase 14 & 15: PWA & UI/UX Premium
- Installable Web App via `manifest.json` and `sw.js`.
- Responsive navigation drawer on mobile and touch-friendly controls.
- Clean typography pairing Google Fonts `Hind Siliguri` (Bangla) and `Playfair Display` (Headings).

---

## 🔒 Security & Privacy Features
- All API routes handling sensitive academic or profile data require authenticated Bearer tokens.
- Passwords are never stored in plaintext.
- Student data is strictly isolated: students and guardians can only view their own records and results.
- Unmatched routes return structured JSON 404 responses.

---

## 📄 License & Attribution
Developed for **Momena Khatun Model Academy (মোমেনা খাতুন মডেল একাডেমি)**, Jamirdia, Hobirbari-2240, Bhaluka, Mymensingh.  
© 2026 All Rights Reserved.
