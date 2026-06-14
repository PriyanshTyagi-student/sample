const fs = require('fs');
let content = fs.readFileSync('lib/api-client.ts', 'utf8');

const authHelper = `
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', 'Bearer ' + token);
  }

  // Intercept and map endpoints
  let finalUrl = url;
  if (url.startsWith('/api/dashboard/metrics')) finalUrl = url.replace('/api/dashboard/metrics', '/api/admin/stats');
  if (url.startsWith('/api/analytics')) finalUrl = url.replace('/api/analytics', '/api/admin/company-growth-analytics');
  if (url.startsWith('/api/logs')) finalUrl = url.replace('/api/logs', '/api/sessions/activities');
  if (url.startsWith('/api/security/blocked-users')) finalUrl = url.replace('/api/security/blocked-users', '/api/sessions/bans');

  const res = await fetch(finalUrl, { ...options, headers });
  
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  
  return res;
}
`;

if (!content.includes('fetchWithAuth')) {
  // Insert after the last interface (SystemLog) or just before the first API function
  content = content.replace('// Dashboard metrics API', authHelper + '\n// Dashboard metrics API');
  
  // Replace fetch with fetchWithAuth
  content = content.replace(/await fetch\(/g, 'await fetchWithAuth(');
  
  fs.writeFileSync('lib/api-client.ts', content);
  console.log('Successfully injected fetchWithAuth and endpoint mappings.');
} else {
  console.log('Already injected.');
}
