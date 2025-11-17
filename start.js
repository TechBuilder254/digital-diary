#!/usr/bin/env node
/**
 * Cross-platform Docker container manager
 * Works on Windows, Linux, and macOS
 */

const { execSync, spawn } = require('child_process');
const os = require('os');
const path = require('path');

const platform = os.platform();
const isWindows = platform === 'win32';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'ignore' : 'inherit',
      ...options 
    });
  } catch (error) {
    if (!options.ignoreErrors) {
      throw error;
    }
    return null;
  }
}

function cleanup() {
  log('\nStopping containers...', 'yellow');
  try {
    exec('docker compose down', { silent: true });
    log('✅ Containers stopped', 'green');
  } catch (error) {
    // Ignore errors during cleanup
  }
  process.exit(0);
}

// Handle Ctrl+C
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Change to project directory
process.chdir(__dirname);

log('🐳 Digital Diary - Docker Manager', 'blue');
log('=====================================\n', 'blue');

// Check if images exist
const hasImages = exec('docker images -q digital-diary-api digital-diary-frontend', { 
  ignoreErrors: true, 
  silent: true 
});

// Stop any running containers
log('Stopping any running containers...', 'yellow');
exec('docker compose down', { ignoreErrors: true, silent: true });

// Start containers - only build if images don't exist or --build flag is passed
const shouldBuild = process.argv.includes('--build') || !hasImages || hasImages.trim() === '';
const buildFlag = shouldBuild ? '--build' : '';

if (shouldBuild) {
  log('Building and starting containers (this may take a few minutes)...', 'yellow');
} else {
  log('Starting containers (using existing images)...', 'yellow');
}

try {
  if (buildFlag) {
    exec(`docker compose up ${buildFlag} -d`);
  } else {
    exec('docker compose up -d');
  }
  log('✅ Containers started successfully', 'green');
} catch (error) {
  log('❌ Failed to start containers', 'red');
  process.exit(1);
}

// Open browser after a short delay
setTimeout(() => {
  const url = 'http://localhost:3000';
  
  let openCommand;
  if (platform === 'win32') {
    openCommand = `start "" "${url}"`;
  } else if (platform === 'darwin') {
    openCommand = `open "${url}"`;
  } else {
    openCommand = `xdg-open "${url}"`;
  }
  
  try {
    execSync(openCommand, { stdio: 'ignore' });
    log(`\n🌐 Browser opened at ${url}`, 'green');
  } catch (error) {
    log(`\n🌐 Please open your browser and visit: ${url}`, 'yellow');
  }
}, 3000);

// Follow logs in foreground
log('\n📋 Following logs (press Ctrl+C to stop)...\n', 'blue');
log('=====================================\n', 'blue');

const logsProcess = spawn('docker', ['compose', 'logs', '-f'], {
  stdio: 'inherit',
  shell: isWindows,
});

logsProcess.on('error', (error) => {
  log(`❌ Error: ${error.message}`, 'red');
  cleanup();
});

logsProcess.on('exit', (code) => {
  cleanup();
});

