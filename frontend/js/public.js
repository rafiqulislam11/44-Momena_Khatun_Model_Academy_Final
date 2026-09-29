/**
 * Momena Khatun Model Academy — Public Website Interactive Features
 * Established: 2019 | Jamirdia, Hobirbari-2240, Bhaluka, Mymensingh
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Live Bangla Date & Copyright Year
  const liveDateEl = document.getElementById('liveDate');
  const currentYearEl = document.getElementById('currentYear');
  
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  if (liveDateEl) {
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const banglaDate = new Intl.DateTimeFormat('bn-BD', options).format(new Date());
      liveDateEl.textContent = `📅 ${banglaDate}`;
    } catch (e) {
      liveDateEl.textContent = `মোমেনা খাতুন মডেল একাডেমি`;
    }
  }

  // 2. Mobile Menu Navigation Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      mobileMenuBtn.setAttribute('aria-label', isOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
      mobileMenuBtn.textContent = isOpen ? '✕' : '☰';
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.textContent = '☰';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('open') && !mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mainNav.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.textContent = '☰';
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.textContent = '☰';
      }
    });
  }

  // 3. Sticky Navbar Shadow & Scroll Spy
  const navbar = document.getElementById('navbar');
  const toTopBtn = document.getElementById('toTopBtn');
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('nav#mainNav a');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 40);
    if (toTopBtn) toTopBtn.classList.toggle('show', scrollY > 450);
  });

  if (toTopBtn) {
    toTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-25% 0px -55% 0px' });

  sections.forEach(sec => observer.observe(sec));

  // 4. Routine & Timetable Viewer Modal
  window.openRoutineModal = function(type, title) {
    const modal = document.getElementById('routineModal');
    const modalTitle = document.getElementById('routineModalTitle');
    const modalContent = document.getElementById('routineModalContent');

    if (!modal) return;
    if (modalTitle) modalTitle.textContent = title;

    if (type === 'exam') {
      modalContent.innerHTML = `
        <div style="margin-bottom: 14px; background: #e0f2fe; padding: 10px 14px; border-radius: 8px; font-size: 13px; color: #0369a1;">
          📌 ২০২৬ শিক্ষাবর্ষের সকল শ্রেণির মডেল টেস্ট ও সাময়িক পরীক্ষার সম্ভাব্য সময়সূচি নিচে দেওয়া হলো।
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>তারিখ ও বার</th>
                <th>সময়</th>
                <th>শ্রেণি</th>
                <th>বিষয়</th>
                <th>কক্ষ নং</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>১৫ অক্টোবর, ২০২৬ (বৃহস্পতিবার)</td>
                <td>সকাল ১০:০০ - ১:০০</td>
                <td>সকল শ্রেণি (প্লে - ৮ম)</td>
                <td>বাংলা ১ম ও ২য় পত্র</td>
                <td>১০১ - ২০৪</td>
              </tr>
              <tr>
                <td>১৮ অক্টোবর, ২০২৬ (রবিবার)</td>
                <td>সকাল ১০:০০ - ১:০০</td>
                <td>সকল শ্রেণি (প্লে - ৮ম)</td>
                <td>ইংরেজি ১ম ও ২য় পত্র</td>
                <td>১০১ - ২০৪</td>
              </tr>
              <tr>
                <td>২০ অক্টোবর, ২০২৬ (মঙ্গলবার)</td>
                <td>সকাল ১০:০০ - ১:০০</td>
                <td>সকল শ্রেণি (প্লে - ৮ম)</td>
                <td>গণিত</td>
                <td>১০১ - ২০৪</td>
              </tr>
              <tr>
                <td>২২ অক্টোবর, ২০২৬ (বৃহস্পতিবার)</td>
                <td>সকাল ১০:০০ - ১২:৩০</td>
                <td>৩য় - ৮ম শ্রেণি</td>
                <td>সাধারণ বিজ্ঞান ও আইসিটি</td>
                <td>১০১ - ২০৪</td>
              </tr>
              <tr>
                <td>২৫ অক্টোবর, ২০২৬ (রবিবার)</td>
                <td>সকাল ১০:০০ - ১২:০০</td>
                <td>সকল শ্রেণি</td>
                <td>ইসলাম ও নৈতিক শিক্ষা</td>
                <td>১০১ - ২০৪</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    } else {
      modalContent.innerHTML = `
        <div style="margin-bottom: 14px; background: #fef3c7; padding: 10px 14px; border-radius: 8px; font-size: 13px; color: #78350f;">
          ⏰ মোমেনা খাতুন মডেল একাডেমির দৈনিক ক্লাস রুটিন ও পিরিয়ড বিভাজন।
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>পিরিয়ড</th>
                <th>সময়</th>
                <th>কার্যক্রম</th>
                <th>বিবরণ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>সমাবেশ</td>
                <td>০৮:৪৫ - ০৯:০০</td>
                <td>দৈনিক সমাবেশ ও শপথ</td>
                <td>কুরআন তিলাওয়াত, জাতীয় সঙ্গীত, পিটি</td>
              </tr>
              <tr>
                <td>১ম পিরিয়ড</td>
                <td>০৯:০০ - ০৯:৪৫</td>
                <td>বাংলা</td>
                <td>বিষয়ভিত্তিক পাঠদান ও পঠন</td>
              </tr>
              <tr>
                <td>২য় পিরিয়ড</td>
                <td>০৯:৪৫ - ১০:৩০</td>
                <td>ইংরেজি</td>
                <td>গ্রামার, রিডিং ও স্পোকেন</td>
              </tr>
              <tr>
                <td>৩য় পিরিয়ড</td>
                <td>১০:৩০ - ১১:১৫</td>
                <td>গণিত</td>
                <td>সমস্যা সমাধান ও অনুশীলন</td>
              </tr>
              <tr>
                <td>টিফিন বিরতি</td>
                <td>১১:১৫ - ১১:৪৫</td>
                <td>টিফিন ও বিশ্রাম</td>
                <td>স্বাস্থ্যকর খাবার ও খেলাধুলা</td>
              </tr>
              <tr>
                <td>৪র্থ পিরিয়ড</td>
                <td>১১:৪৫ - ১২:৩০</td>
                <td>বিজ্ঞান / পরিবেশ</td>
                <td>বাস্তব প্রজেক্ট ও সাধারণ জ্ঞান</td>
              </tr>
              <tr>
                <td>৫ম পিরিয়ড</td>
                <td>১২:৩০ - ০১:১৫</td>
                <td>ধর্ম ও চারিত্রিক শিক্ষা</td>
                <td>আদব, মাসনুন দুয়া ও নৈতিকতা</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  // 5. FAQ Accordion Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      if (isActive) {
        item.classList.remove('active');
        if (answer) answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // 6. Notice Filtering & Search
  const noticeTabs = document.querySelectorAll('.notice-tab-btn');
  const noticeSearchInput = document.getElementById('noticeSearchInput');
  const noticeItems = document.querySelectorAll('.notice-item');

  function filterNotices() {
    const activeTab = document.querySelector('.notice-tab-btn.active')?.dataset.category || 'all';
    const searchQuery = (noticeSearchInput?.value || '').toLowerCase().trim();

    noticeItems.forEach(item => {
      const itemCategory = item.dataset.category || '';
      const itemText = item.textContent?.toLowerCase() || '';
      const matchesCategory = (activeTab === 'all' || itemCategory === activeTab);
      const matchesSearch = !searchQuery || itemText.includes(searchQuery);

      item.style.display = (matchesCategory && matchesSearch) ? 'grid' : 'none';
    });
  }

  noticeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      noticeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterNotices();
    });
  });

  noticeSearchInput?.addEventListener('input', filterNotices);

  // 7. Gallery Filtering & Enhanced Lightbox
  const galleryFilters = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const closeLightboxBtn = document.getElementById('closeLightboxBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  galleryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const itemCat = item.dataset.category;
        if (filter === 'all' || itemCat === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  let currentImageIndex = 0;
  let activeGalleryList = [];

  function updateActiveGalleryList() {
    activeGalleryList = Array.from(galleryItems).filter(item => item.style.display !== 'none');
  }

  function showLightboxIndex(index) {
    if (activeGalleryList.length === 0) return;
    if (index < 0) index = activeGalleryList.length - 1;
    if (index >= activeGalleryList.length) index = 0;

    currentImageIndex = index;
    const targetItem = activeGalleryList[currentImageIndex];
    if (lightboxImg) lightboxImg.src = targetItem.dataset.full;
    if (lightboxCaption) lightboxCaption.textContent = targetItem.dataset.caption || '';
    if (lightboxCounter) {
      lightboxCounter.textContent = `${toBanglaNumber(currentImageIndex + 1)} / ${toBanglaNumber(activeGalleryList.length)}`;
    }
  }

  function openLightbox(item) {
    updateActiveGalleryList();
    const index = activeGalleryList.indexOf(item);
    currentImageIndex = index !== -1 ? index : 0;
    showLightboxIndex(currentImageIndex);
    lightboxModal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxModal?.classList.remove('open');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  closeLightboxBtn?.addEventListener('click', closeLightbox);
  lightboxPrevBtn?.addEventListener('click', () => showLightboxIndex(currentImageIndex - 1));
  lightboxNextBtn?.addEventListener('click', () => showLightboxIndex(currentImageIndex + 1));

  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightboxModal?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightboxIndex(currentImageIndex - 1);
    if (e.key === 'ArrowRight') showLightboxIndex(currentImageIndex + 1);
  });

  // 8. Notice Reader Modal Handler
  window.openNoticeModal = function(title, body, date, category) {
    const noticeModal = document.getElementById('noticeModal');
    const noticeModalTitle = document.getElementById('noticeModalHeading');
    const noticeModalBodyText = document.getElementById('noticeModalBodyText');
    const noticeModalDate = document.getElementById('noticeModalDate');
    const noticeModalCategory = document.getElementById('noticeModalCategory');

    if (noticeModalTitle) noticeModalTitle.textContent = title;
    if (noticeModalBodyText) noticeModalBodyText.textContent = body;
    if (noticeModalDate) noticeModalDate.textContent = date;
    if (noticeModalCategory) noticeModalCategory.textContent = category;

    noticeModal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  document.getElementById('closeNoticeModalBtn')?.addEventListener('click', () => {
    document.getElementById('noticeModal')?.classList.remove('open');
    document.body.style.overflow = '';
  });

  // 9. Online Admission Modal Handler
  const admissionModal = document.getElementById('admissionModal');
  window.openAdmissionModal = function() {
    admissionModal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  function closeAdmissionModal() {
    admissionModal?.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('openAdmissionModalBtn')?.addEventListener('click', window.openAdmissionModal);
  document.getElementById('heroAdmissionBtn')?.addEventListener('click', window.openAdmissionModal);
  document.getElementById('closeAdmissionModalBtn')?.addEventListener('click', closeAdmissionModal);

  admissionModal?.addEventListener('click', (e) => {
    if (e.target === admissionModal) closeAdmissionModal();
  });

  let currentAdmissionData = {};

  document.getElementById('onlineAdmissionForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const studentName = document.getElementById('adm_studentName')?.value.trim();
    const studentClass = document.getElementById('adm_class')?.value;
    const fatherName = document.getElementById('adm_fatherName')?.value.trim();
    const phone = document.getElementById('adm_phone')?.value.trim();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const appId = `MKMA-2026-${randomCode}`;
    const todayFormatted = new Intl.DateTimeFormat('bn-BD', { dateStyle: 'long' }).format(new Date());

    currentAdmissionData = { appId, studentName, studentClass, fatherName, phone, todayFormatted };

    document.getElementById('slipApplicationId').textContent = `ID: ${appId}`;
    document.getElementById('slipStudentName').textContent = studentName;
    document.getElementById('slipClass').textContent = studentClass;
    document.getElementById('slipGuardian').textContent = fatherName;
    document.getElementById('slipPhone').textContent = phone;
    document.getElementById('slipDate').textContent = todayFormatted;

    document.getElementById('admissionFormView').style.display = 'none';
    document.getElementById('admissionSuccessSlip').style.display = 'block';

    if (window.Toast) {
      window.Toast.success(`আবেদন সফল হয়েছে! আবেদন আইডি: ${appId}`);
    }
  });

  document.getElementById('newAdmissionBtn')?.addEventListener('click', () => {
    document.getElementById('onlineAdmissionForm')?.reset();
    document.getElementById('admissionFormView').style.display = 'block';
    document.getElementById('admissionSuccessSlip').style.display = 'none';
  });

  document.getElementById('sendSlipWhatsAppBtn')?.addEventListener('click', () => {
    if (!currentAdmissionData.studentName) return;
    const msg = `আসসালামু আলাইকুম, আমি মোমেনা খাতুন মডেল একাডেমিতে অনলাইনে ভর্তি আবেদন করেছি।%0A%0A*আবেদন আইডি:* ${currentAdmissionData.appId}%0A*শিক্ষার্থী:* ${currentAdmissionData.studentName}%0A*শ্রেণি:* ${currentAdmissionData.studentClass}%0A*অভিভাবক:* ${currentAdmissionData.fatherName}%0A*মোবাইল:* ${currentAdmissionData.phone}`;
    window.open(`https://wa.me/8801771907474?text=${msg}`, '_blank');
  });

  // 10. Contact Form Submission
  document.getElementById('mainContactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('c_name')?.value.trim();
    if (window.Toast) {
      window.Toast.success(`ধন্যবাদ ${name}! আপনার বার্তাটি সফলভাবে পৌঁছাল।`);
    }
    e.target.reset();
  });

  document.getElementById('sendViaWhatsAppBtn')?.addEventListener('click', () => {
    const name = document.getElementById('c_name')?.value.trim() || 'অভিভাবক';
    const phone = document.getElementById('c_phone')?.value.trim() || '';
    const subject = document.getElementById('c_subject')?.value || 'সাধারণ বার্তা';
    const message = document.getElementById('c_message')?.value.trim() || 'ভর্তি সম্পর্কে বিস্তারিত তথ্য জানতে চাই।';

    const fullMsg = `আসসালামু আলাইকুম,%0A*নাম:* ${encodeURIComponent(name)}%0A*মোবাইল:* ${encodeURIComponent(phone)}%0A*বিষয়:* ${encodeURIComponent(subject)}%0A*বার্তা:* ${encodeURIComponent(message)}`;
    window.open(`https://wa.me/8801771907474?text=${fullMsg}`, '_blank');
  });

  function toBanglaNumber(num) {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, d => banglaDigits[Number(d)]);
  }
});
