/**
 * Light / Dark Mode System — Complete Dual Theme Architecture
 */

(function () {
  const THEME_KEY = 'mkma_theme';
  let currentTheme = localStorage.getItem(THEME_KEY) || 'light';
  let lastToggleTime = 0;

  function updateButtonLabels(theme) {
    const isDark = theme === 'dark';
    const isBn = typeof I18n !== 'undefined' && typeof I18n.currentLang === 'function' ? I18n.currentLang() === 'bn' : true;
    const label = isDark ? (isBn ? 'লাইট' : 'Light') : (isBn ? 'ডার্ক' : 'Dark');
    const icon = isDark ? '☀️' : '🌙';

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.innerHTML = `${icon} <span>${label}</span>`;
    });
  }

  function applyTheme(theme) {
    currentTheme = (theme === 'dark') ? 'dark' : 'light';
    
    // Set attributes & class on root html and body
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.classList.toggle('dark-theme', currentTheme === 'dark');
    if (document.body) {
      document.body.classList.toggle('dark-theme', currentTheme === 'dark');
      document.body.setAttribute('data-theme', currentTheme);
    }

    try {
      localStorage.setItem(THEME_KEY, currentTheme);
    } catch (e) {}

    updateButtonLabels(currentTheme);
  }

  function toggle() {
    const now = Date.now();
    if (now - lastToggleTime < 120) return; // Prevent double trigger
    lastToggleTime = now;
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  window.Theme = {
    get: () => currentTheme,
    set: applyTheme,
    toggle,
    init: () => applyTheme(currentTheme)
  };
  window.toggleTheme = toggle;

  // Immediate execution to prevent theme flashing
  applyTheme(currentTheme);

  // Global delegated click listener ensures theme toggles work anywhere, even dynamically loaded buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-toggle-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    }
  });

  // Re-sync labels once DOM is fully ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyTheme(currentTheme);
    });
  } else {
    applyTheme(currentTheme);
  }
})();
