const fs = require('fs');

async function runAudit() {
  const loginRes = await fetch('http://localhost:5000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ empId: 'ADMIN-2026', password: 'WTTS2026@' })
  });
  
  if (!loginRes.ok) {
    console.error('Login failed', await loginRes.text());
    return;
  }
  
  const loginData = await loginRes.json();
  const token = loginData.token;

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const results = {};

  // 1. Stats
  const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers: authHeaders });
  results.stats = await statsRes.json();

  // 2. Growth
  const growthRes = await fetch('http://localhost:5000/api/admin/company-growth-analytics', { headers: authHeaders });
  results.growth = await growthRes.json();

  // 3. Sessions
  const sessionsRes = await fetch('http://localhost:5000/api/sessions', { headers: authHeaders });
  results.sessions = await sessionsRes.json();

  // 4. Activities
  const activitiesRes = await fetch('http://localhost:5000/api/sessions/activities', { headers: authHeaders });
  results.activities = await activitiesRes.json();

  // 5. Events
  const eventsRes = await fetch('http://localhost:5000/api/events', { headers: authHeaders });
  results.events = await eventsRes.json();

  // 6. Telemetry
  const telemetryRes = await fetch('http://localhost:5000/api/site/telemetry/nodes', { 
    headers: { ...authHeaders, 'x-performance-key': '7xTN5aqUwWGzhDJs' } 
  });
  results.telemetry = await telemetryRes.json();

  console.log(JSON.stringify(results, null, 2));
}

runAudit();
