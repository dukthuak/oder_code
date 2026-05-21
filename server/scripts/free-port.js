/**
 * Giai phong port truoc khi npm start (tranh EADDRINUSE).
 * Mac dinh PORT trong .env hoac 3001.
 */
const { execSync } = require('child_process');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const port = process.env.PORT || 3001;

try {
  const out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
    encoding: 'utf8',
  });
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    const m = line.trim().match(/\s+(\d+)\s*$/);
    if (m) pids.add(m[1]);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      console.log(`Da dong process PID ${pid} (port ${port})`);
    } catch {
      /* ignore */
    }
  }
  if (pids.size) {
    execSync('timeout /t 1 /nobreak >nul', { stdio: 'ignore', shell: true });
  }
} catch {
  console.log(`Port ${port} san sang.`);
}
