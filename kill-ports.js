// Cross-platform script to kill processes on ports 5000 and 3000
const { execSync } = require('child_process');
const os = require('os');

const platform = os.platform();
const ports = [5000, 3000];

console.log('Killing processes on ports 5000 and 3000...');

function killPortWindows(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = result.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 0) {
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      }
    });
    
    pids.forEach(pid => {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`✅ Killed process ${pid} on port ${port}`);
      } catch (e) {
        // Process might already be dead
      }
    });
  } catch (e) {
    console.log(`ℹ️  Port ${port} is already free`);
  }
}

function killPortUnix(port) {
  try {
    const pid = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
    if (pid) {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
      console.log(`✅ Killed process on port ${port}`);
    }
  } catch (e) {
    console.log(`ℹ️  Port ${port} is already free`);
  }
}

ports.forEach(port => {
  if (platform === 'win32') {
    killPortWindows(port);
  } else {
    killPortUnix(port);
  }
});

// Kill node processes (optional cleanup)
if (platform !== 'win32') {
  const nodeProcesses = ['node.*server-dev', 'react-scripts', 'concurrently'];
  nodeProcesses.forEach(pattern => {
    try {
      execSync(`pkill -9 -f "${pattern}"`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore errors - processes may not exist
    }
  });
}

console.log('✅ Port cleanup complete');

