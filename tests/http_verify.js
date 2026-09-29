const http = require('http');

const endpoints = [
  { path: '/', name: 'Public Website (index.html)' },
  { path: '/portal.html', name: 'Smart Portal (portal.html)' },
  { path: '/css/variables.css', name: 'CSS Variables' },
  { path: '/css/public.css', name: 'CSS Public' },
  { path: '/css/portal.css', name: 'CSS Portal' },
  { path: '/js/public.js', name: 'JS Public' },
  { path: '/js/portal.js', name: 'JS Portal' },
  { path: '/api/system/health', name: 'API Health Endpoint' },
  { path: '/api/notices', name: 'Public Notices API' },
  { path: '/manifest.json', name: 'PWA Web App Manifest' },
  { path: '/sw.js', name: 'Service Worker' },
  { path: '/assets/logo.png', name: 'Official School Logo' },
  { path: '/assets/academy-greeting-message.jpg', name: 'Managing Director Greeting Poster' }
];

async function checkUrl(item) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000${item.path}`, (res) => {
      let data = '';
      res.on('data', chunk => { if (data.length < 500) data += chunk; });
      res.on('end', () => {
        resolve({
          name: item.name,
          path: item.path,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          ok: res.statusCode === 200
        });
      });
    }).on('error', (err) => {
      resolve({
        name: item.name,
        path: item.path,
        status: 'ERR',
        error: err.message,
        ok: false
      });
    });
  });
}

(async () => {
  console.log('🔍 Verifying all web assets and routes on http://localhost:5000...\n');
  let allPass = true;
  for (const item of endpoints) {
    const result = await checkUrl(item);
    if (result.ok) {
      console.log(`✅ [${result.status}] ${result.name} -> ${item.path} (${result.contentType})`);
    } else {
      console.error(`❌ [${result.status}] ${result.name} -> ${item.path} (Error: ${result.error})`);
      allPass = false;
    }
  }

  if (allPass) {
    console.log('\n🌟 ALL 13 CORE ASSETS AND ENDPOINTS ARE ONLINE AND SERVING 200 OK!');
    process.exit(0);
  } else {
    console.error('\n⚠️ Some endpoints failed.');
    process.exit(1);
  }
})();
