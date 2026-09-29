const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('🌙 Starting Automated Theme Engine (Dark & Light Mode) Test Suite...\n');

// Mock localStorage
const storage = {};
const mockLocalStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

// Mock Document and Elements
class MockElement {
  constructor(tag, id = '', className = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = className;
    this.attributes = {};
    this.classList = {
      _classes: new Set(className.split(' ').filter(Boolean)),
      toggle: (cls, force) => {
        if (force === undefined) {
          if (this.classList._classes.has(cls)) this.classList._classes.delete(cls);
          else this.classList._classes.add(cls);
        } else if (force) {
          this.classList._classes.add(cls);
        } else {
          this.classList._classes.delete(cls);
        }
      },
      contains: (cls) => this.classList._classes.has(cls)
    };
    this.innerHTML = '';
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k]; }
  closest(sel) {
    if (sel === '.theme-toggle-btn' && this.className.includes('theme-toggle-btn')) return this;
    return null;
  }
}

const docElement = new MockElement('html');
const docBody = new MockElement('body');
const btn1 = new MockElement('button', 'btn1', 'theme-toggle-btn');
const btn2 = new MockElement('button', 'btn2', 'theme-toggle-btn');

const clickListeners = [];
const mockDocument = {
  documentElement: docElement,
  body: docBody,
  readyState: 'complete',
  querySelectorAll: (sel) => {
    if (sel === '.theme-toggle-btn') return [btn1, btn2];
    return [];
  },
  addEventListener: (event, handler) => {
    if (event === 'click') clickListeners.push(handler);
  }
};

const themeCode = fs.readFileSync('frontend/js/theme.js', 'utf8');

const context = {
  window: {},
  document: mockDocument,
  localStorage: mockLocalStorage,
  Date,
  console
};

vm.createContext(context);
vm.runInContext(themeCode, context);

// Test 1: Initial Theme is Light
assert.strictEqual(context.window.Theme.get(), 'light', 'Default theme must be light');
assert.strictEqual(docElement.getAttribute('data-theme'), 'light', 'HTML attribute must be light');
assert(!docElement.classList.contains('dark-theme'), 'HTML classList must not contain dark-theme initially');
console.log('✅ 1. Initial State: Correctly initializes in Light Mode.');

// Test 2: Toggle to Dark Mode
context.window.Theme.toggle();
assert.strictEqual(context.window.Theme.get(), 'dark', 'Theme must be dark after toggle');
assert.strictEqual(docElement.getAttribute('data-theme'), 'dark', 'HTML attribute must be dark');
assert(docElement.classList.contains('dark-theme'), 'HTML classList must have dark-theme');
assert.strictEqual(mockLocalStorage.getItem('mkma_theme'), 'dark', 'localStorage must persist dark');
assert(btn1.innerHTML.includes('☀️') || btn1.innerHTML.includes('লাইট'), 'Button 1 icon must update to light toggle');
assert(btn2.innerHTML.includes('☀️') || btn2.innerHTML.includes('লাইট'), 'Button 2 icon must update to light toggle');
console.log('✅ 2. Toggle to Dark: Switches attribute, classList, button labels, and localStorage.');

// Test 3: Toggle back to Light Mode
// Simulate delay to pass the debounce guard
setTimeout(() => {
  context.window.Theme.toggle();
  assert.strictEqual(context.window.Theme.get(), 'light', 'Theme must be light after second toggle');
  assert.strictEqual(docElement.getAttribute('data-theme'), 'light', 'HTML attribute must be light');
  assert(!docElement.classList.contains('dark-theme'), 'dark-theme class must be removed');
  assert.strictEqual(mockLocalStorage.getItem('mkma_theme'), 'light', 'localStorage must persist light');
  assert(btn1.innerHTML.includes('🌙') || btn1.innerHTML.includes('ডার্ক'), 'Button 1 icon must update to dark toggle');
  console.log('✅ 3. Toggle to Light: Correctly switches back to light mode.');

  // Test 4: Delegated Click Handler on document
  setTimeout(() => {
    const fakeEvent = {
      target: btn1,
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    clickListeners.forEach(fn => fn(fakeEvent));
    assert.strictEqual(context.window.Theme.get(), 'dark', 'Clicking button via delegated event must toggle theme');
    console.log('✅ 4. Click Delegation: Global click listener successfully triggers toggle.');

    console.log('\n🎉 ALL THEME ENGINE TESTS PASSED SUCCESSFULLY!');
  }, 150);
}, 150);
