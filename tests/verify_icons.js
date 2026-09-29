const fs = require('fs');
const vm = require('vm');

const portalCode = fs.readFileSync('frontend/js/portal.js', 'utf8');

let navHtml = '';
const mockDoc = {
  getElementById: (id) => {
    if (id === 'sidebarNav') {
      return {
        set innerHTML(val) { navHtml = val; },
        get innerHTML() { return navHtml; }
      };
    }
    return { textContent: '', className: '' };
  },
  querySelectorAll: () => [],
  addEventListener: () => {}
};

const context = {
  window: {},
  document: mockDoc,
  console: console,
  localStorage: { getItem: () => null, setItem: () => {} },
  navigator: { serviceWorker: { register: () => Promise.resolve({ update: () => {} }) } },
  I18n: { t: (k) => k },
  Api: {},
  Components: {}
};
vm.createContext(context);
vm.runInContext(portalCode, context);

const roles = ['SUPER ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'GUARDIAN'];

const App = context.window.PortalApp || context.PortalApp;

roles.forEach(role => {
  App.currentUser = { role };
  App.renderSidebarNav();
  console.log(`\n================== ROLE: ${role} ==================`);
  
  // Parse links
  const regex = /<a class="sidebar-link"[\s\S]*?<\/a>/g;
  let match;
  while ((match = regex.exec(navHtml)) !== null) {
    const linkStr = match[0];
    const iconMatch = linkStr.match(/<span class="sidebar-icon">([\s\S]*?)<\/span>/);
    const labelMatch = linkStr.match(/<span class="sidebar-icon">[\s\S]*?<\/span>\s*<span>([\s\S]*?)<\/span>/);
    const icon = iconMatch ? iconMatch[1].trim() : 'NONE';
    const label = labelMatch ? labelMatch[1].trim() : 'NONE';
    
    // Check if label contains any emoji
    const hasEmojiInLabel = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(label);
    console.log(`[Icon]: ${icon} | [Label]: "${label}" | Double Icon?: ${hasEmojiInLabel ? 'YES (BUG)' : 'NO (CLEAN)'}`);
  }
});
