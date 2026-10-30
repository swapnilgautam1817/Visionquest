import { spawn } from 'child_process';

console.log('==================================================================');
console.log(' Starting OpticGuard AI - Tri-System Architecture Suite           ');
console.log(' [1] Client  : React + Vite (Vercel target)                      ');
console.log(' [2] Server  : Edge Gateway & Stream Relay (ws://localhost:5001) ');
console.log(' [3] Backend : Supabase & Gemini Vision Core (http://localhost:5000)');
console.log('==================================================================');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Backend Service (Supabase & Gemini AI)
const backend = spawn(npmCmd, ['--prefix', 'backend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// 2. Gateway Server (Live Stream Relay)
const server = spawn(npmCmd, ['--prefix', 'server', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// 3. Client Web App (Vercel SPA)
const client = spawn(npmCmd, ['--prefix', 'client', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  backend.kill();
  server.kill();
  client.kill();
  process.exit();
});
