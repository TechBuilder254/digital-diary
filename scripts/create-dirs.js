#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Cross-platform directory creation script
 * Ensures all necessary directories exist for the Digital Diary application
 */

const directories = [
  'server/uploads',
  'server/uploads/audio',
  'server/logs',
  'frontend/public/uploads'
];

function createDirectories() {
  console.log('Creating necessary directories...');
  
  directories.forEach(dir => {
    const fullPath = path.resolve(__dirname, '..', dir);
    
    try {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true, mode: 0o755 });
        console.log(`✅ Created directory: ${fullPath}`);
      } else {
        console.log(`📁 Directory already exists: ${fullPath}`);
      }
    } catch (error) {
      console.error(`❌ Error creating directory ${fullPath}:`, error.message);
    }
  });
  
  // Create .gitkeep files to ensure directories are tracked by git
  const gitkeepDirs = [
    'server/uploads/audio'
  ];
  
  gitkeepDirs.forEach(dir => {
    const gitkeepPath = path.resolve(__dirname, '..', dir, '.gitkeep');
    const dirPath = path.resolve(__dirname, '..', dir);
    
    try {
      if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '# This file ensures the directory is created and tracked by git\n');
        console.log(`✅ Created .gitkeep: ${gitkeepPath}`);
      }
    } catch (error) {
      console.error(`❌ Error creating .gitkeep ${gitkeepPath}:`, error.message);
    }
  });
  
  console.log('\n🎉 Directory setup completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Run "npm install" to install dependencies');
  console.log('2. Run "npm start" to start the application');
  console.log('3. Open http://localhost:3000 in your browser');
}

// Run the script
createDirectories();
