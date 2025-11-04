#!/usr/bin/env node

/**
 * Quick script to update all API URLs from localhost:5000 to relative paths
 * This makes the frontend work with Vercel dev server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendSrc = path.join(__dirname, 'frontend', 'src');

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace http://localhost:5000/api with /api
    content = content.replace(/http:\/\/localhost:5000\/api/g, '/api');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function findAndReplaceInDirectory(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      count += findAndReplaceInDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (replaceInFile(filePath)) {
        count++;
      }
    }
  }
  
  return count;
}

console.log('🔧 Fixing API URLs in frontend...\n');
const count = findAndReplaceInDirectory(frontendSrc);
console.log(`\n✅ Updated ${count} files!`);
console.log('\n📝 Next steps:');
console.log('1. For Vercel dev: Run "npx vercel dev" (after login)');
console.log('2. For quick local test: API will work with relative paths');

