/**
 * Momena Khatun Model Academy — Client Logic & Interactions
 * Established: 2019 | Jamirdia, Hobirbari, Bhaluka, Mymensingh
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

  // 2. Mobile Menu Drawer
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');

  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      mobileMenuBtn.setAttribute('aria-label', isOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
      mobileMenuBtn.textContent = isOpen ? '✕' : '☰';
    });

    // Close mobile nav when clicking a link
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.textContent = '☰';
      });
    });
  }

  // 3. Scroll Spy & Sticky Header Shadow
  const navbar = document.getElementById('navbar');
  const toTopBtn = document.getElementById('toTopBtn');
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('nav#mainNav a');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Navbar shadow
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 40);
    }
    
    // Scroll to top visibility
    if (toTopBtn) {
      toTopBtn.classList.toggle('show', scrollY > 450);
    }
  });

  if (toTopBtn) {
    toTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Intersection Observer for active nav highlighting
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

  // 4. FAQ Accordion System
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other FAQs
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      // Toggle current FAQ
      if (isActive) {
        item.classList.remove('active');
        if (answer) answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // 5. Notice Board Filtering & Keyword Search
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

  // 6. Photo Gallery Filtering & Enhanced Lightbox
  const galleryFilters = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const closeLightboxBtn = document.getElementById('closeLightboxBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  // Filter gallery items
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

  // Collect visible gallery elements for lightbox navigation
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
    const fullSrc = targetItem.dataset.full;
    const caption = targetItem.dataset.caption || '';

    if (lightboxImg) lightboxImg.src = fullSrc;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${toBanglaNumber(currentImageIndex + 1)} / ${toBanglaNumber(activeGalleryList.length)}`;
    }
  }

  function openLightbox(item) {
    updateActiveGalleryList();
    const index = activeGalleryList.indexOf(item);
    if (index !== -1) {
      currentImageIndex = index;
    } else {
      currentImageIndex = 0;
    }
    showLightboxIndex(currentImageIndex);
    lightboxModal?.classList.add('open');
    lightboxModal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeLightbox() {
    lightboxModal?.classList.remove('open');
    lightboxModal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  closeLightboxBtn?.addEventListener('click', closeLightbox);
  lightboxPrevBtn?.addEventListener('click', () => showLightboxIndex(currentImageIndex - 1));
  lightboxNextBtn?.addEventListener('click', () => showLightboxIndex(currentImageIndex + 1));

  // Close lightbox on clicking outside image
  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightboxIndex(currentImageIndex - 1);
    if (e.key === 'ArrowRight') showLightboxIndex(currentImageIndex + 1);
  });

  // 7. Notice Reader Modal Handler
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
    noticeModal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  };

  const closeNoticeModalBtn = document.getElementById('closeNoticeModalBtn');
  closeNoticeModalBtn?.addEventListener('click', () => {
    const noticeModal = document.getElementById('noticeModal');
    noticeModal?.classList.remove('open');
    noticeModal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  });

  // 8. Online Admission Modal & Application Slip Generator
  const admissionModal = document.getElementById('admissionModal');
  const openAdmissionModalBtn = document.getElementById('openAdmissionModalBtn');
  const heroAdmissionBtn = document.getElementById('heroAdmissionBtn');
  const closeAdmissionModalBtn = document.getElementById('closeAdmissionModalBtn');
  const onlineAdmissionForm = document.getElementById('onlineAdmissionForm');
  const admissionFormView = document.getElementById('admissionFormView');
  const admissionSuccessSlip = document.getElementById('admissionSuccessSlip');
  const newAdmissionBtn = document.getElementById('newAdmissionBtn');
  const sendSlipWhatsAppBtn = document.getElementById('sendSlipWhatsAppBtn');

  window.openAdmissionModal = function() {
    admissionModal?.classList.add('open');
    admissionModal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  };

  function closeAdmissionModal() {
    admissionModal?.classList.remove('open');
    admissionModal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  openAdmissionModalBtn?.addEventListener('click', window.openAdmissionModal);
  heroAdmissionBtn?.addEventListener('click', window.openAdmissionModal);
  closeAdmissionModalBtn?.addEventListener('click', closeAdmissionModal);

  admissionModal?.addEventListener('click', (e) => {
    if (e.target === admissionModal) closeAdmissionModal();
  });

  let currentAdmissionData = {};

  onlineAdmissionForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const studentName = document.getElementById('adm_studentName')?.value.trim();
    const studentClass = document.getElementById('adm_class')?.value;
    const fatherName = document.getElementById('adm_fatherName')?.value.trim();
    const phone = document.getElementById('adm_phone')?.value.trim();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const appId = `MKMA-2026-${randomCode}`;
    const todayFormatted = new Intl.DateTimeFormat('bn-BD', { dateStyle: 'long' }).format(new Date());

    currentAdmissionData = {
      appId,
      studentName,
      studentClass,
      fatherName,
      phone,
      todayFormatted
    };

    // Populate slip
    document.getElementById('slipApplicationId').textContent = `ID: ${appId}`;
    document.getElementById('slipStudentName').textContent = studentName;
    document.getElementById('slipClass').textContent = studentClass;
    document.getElementById('slipGuardian').textContent = fatherName;
    document.getElementById('slipPhone').textContent = phone;
    document.getElementById('slipDate').textContent = todayFormatted;

    // Toggle views
    if (admissionFormView) admissionFormView.style.display = 'none';
    if (admissionSuccessSlip) admissionSuccessSlip.style.display = 'block';

    showToast(`✅ আবেদন সফল! আইডি: ${appId}`);
  });

  newAdmissionBtn?.addEventListener('click', () => {
    onlineAdmissionForm?.reset();
    if (admissionFormView) admissionFormView.style.display = 'block';
    if (admissionSuccessSlip) admissionSuccessSlip.style.display = 'none';
  });

  sendSlipWhatsAppBtn?.addEventListener('click', () => {
    if (!currentAdmissionData.studentName) return;
    const msg = `আসসালামু আলাইকুম, আমি মোমেনা খাতুন মডেল একাডেমিতে অনলাইনে ভর্তি আবেদন জমা দিয়েছি।%0A%0A*আবেদন নং:* ${currentAdmissionData.appId}%0A*শিক্ষার্থীর নাম:* ${currentAdmissionData.studentName}%0A*শ্রেণি:* ${currentAdmissionData.studentClass}%0A*অভিভাবক:* ${currentAdmissionData.fatherName}%0A*মোবাইল:* ${currentAdmissionData.phone}%0A%0Aঅনুগ্রহ করে পরবর্তী প্রক্রিয়া জানাবেন।`;
    window.open(`https://wa.me/8801771907474?text=${msg}`, '_blank');
  });

  // 9. Contact Form Handling (Replacing Alert with Toast + WhatsApp integration)
  const mainContactForm = document.getElementById('mainContactForm');
  const sendViaWhatsAppBtn = document.getElementById('sendViaWhatsAppBtn');

  mainContactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('c_name')?.value.trim();
    const phone = document.getElementById('c_phone')?.value.trim();
    const message = document.getElementById('c_message')?.value.trim();

    showToast(`ধন্যবাদ ${name}! আপনার বার্তাটি গ্রহণ করা হয়েছে।`);
    mainContactForm.reset();
  });

  sendViaWhatsAppBtn?.addEventListener('click', () => {
    const name = document.getElementById('c_name')?.value.trim() || 'অভিভাবক';
    const phone = document.getElementById('c_phone')?.value.trim() || '';
    const subject = document.getElementById('c_subject')?.value || 'সাধারণ বার্তা';
    const message = document.getElementById('c_message')?.value.trim() || 'ভর্তি সম্পর্কে বিস্তারিত তথ্য জানতে চাই।';

    const fullMsg = `আসসালামু আলাইকুম,%0A*নাম:* ${encodeURIComponent(name)}%0A*মোবাইল:* ${encodeURIComponent(phone)}%0A*বিষয়:* ${encodeURIComponent(subject)}%0A*বার্তা:* ${encodeURIComponent(message)}`;
    window.open(`https://wa.me/8801771907474?text=${fullMsg}`, '_blank');
  });

  // 10. Toast Notification Helper
  function showToast(text) {
    const toast = document.getElementById('toastMsg');
    const toastText = document.getElementById('toastText');
    if (!toast || !toastText) return;

    toastText.textContent = text;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // Convert digits to Bengali numbers
  function toBanglaNumber(num) {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, d => banglaDigits[Number(d)]);
  }
});
