/**
 * Bilingual Architecture (Bangla / English)
 */

const translations = {
  bn: {
    school_name: "মোমেনা খাতুন মডেল একাডেমি",
    tagline: "জ্ঞান • শৃঙ্খলা • সাফল্য",
    dashboard: "ড্যাশবোর্ড",
    students: "শিক্ষার্থীবৃন্দ",
    teachers: "শিক্ষকমণ্ডলী",
    guardians: "অভিভাবকবৃন্দ",
    academic: "একাডেমিক কাঠামো",
    classes: "শ্রেণিসমূহ",
    subjects: "বিষয়সমূহ",
    attendance: "উপস্থিতি ব্যবস্থাপনা",
    exams: "পরীক্ষা ও ফলাফল",
    notices: "নোটিশ ও ঘোষণা",
    routines: "রুটিন ও সময়সূচি",
    homework: "হোমওয়ার্ক ও অ্যাসাইনমেন্ট",
    reports: "রিপোর্ট ও অ্যানালিটিক্স",
    settings: "সিস্টেম সেটিংস",
    logout: "লগআউট",
    login: "লগইন",
    present: "উপস্থিত",
    absent: "অনুপস্থিত",
    late: "দেরি",
    leave: "ছুটি",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    loading: "লোড হচ্ছে...",
    success: "সফলভাবে সম্পন্ন হয়েছে",
    error: "একটি ত্রুটি হয়েছে"
  },
  en: {
    school_name: "Momena Khatun Model Academy",
    tagline: "Knowledge • Discipline • Success",
    dashboard: "Dashboard",
    students: "Students",
    teachers: "Teachers",
    guardians: "Guardians",
    academic: "Academic Structure",
    classes: "Classes",
    subjects: "Subjects",
    attendance: "Attendance",
    exams: "Exams & Results",
    notices: "Notices & Announcements",
    routines: "Class & Exam Routines",
    homework: "Homework & Assignments",
    reports: "Reports & Analytics",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    present: "Present",
    absent: "Absent",
    late: "Late",
    leave: "Leave",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    success: "Operation successful",
    error: "An error occurred"
  }
};

let currentLang = localStorage.getItem('mkma_lang') || 'bn';

function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('mkma_lang', lang);
    document.documentElement.lang = lang;
    updateDOMTranslations();
  }
}

function t(key) {
  return translations[currentLang]?.[key] || translations['en']?.[key] || key;
}

function updateDOMTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  const langBtn = document.getElementById('langToggleBtn');
  if (langBtn) {
    langBtn.textContent = currentLang === 'bn' ? 'English' : 'বাংলা';
  }
}

window.I18n = {
  currentLang: () => currentLang,
  setLanguage,
  t,
  toggle: () => setLanguage(currentLang === 'bn' ? 'en' : 'bn'),
  init: () => {
    document.documentElement.lang = currentLang;
    updateDOMTranslations();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.I18n.init();
});
