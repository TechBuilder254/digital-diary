#!/usr/bin/env node
/**
 * Check Users Script
 * Lists all users in the database to help diagnose login issues
 */

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}${message}${colors.reset}`);
}

async function listUsers() {
  log('\n👥 Listing all users in database...', 'cyan');
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ Missing Supabase configuration', 'red');
    process.exit(1);
  }

  try {
    const url = `${supabaseUrl}/rest/v1/users?select=id,username,email,join_date&order=id.asc`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
    }

    const users = await response.json();
    
    if (!users || users.length === 0) {
      log('⚠️  No users found in database', 'yellow');
      log('   Run: npm run test:login to create a test user', 'cyan');
      return;
    }

    log(`\n✅ Found ${users.length} user(s):\n`, 'green');
    
    users.forEach((user, index) => {
      log(`User #${index + 1}:`, 'cyan');
      log(`   ID: ${user.id}`, 'yellow');
      log(`   Username: ${user.username}`, 'yellow');
      log(`   Email: ${user.email}`, 'yellow');
      log(`   Join Date: ${user.join_date}`, 'yellow');
      log('');
    });

    log('💡 To test login with a user:', 'blue');
    log('   1. Use the username exactly as shown above', 'cyan');
    log('   2. Make sure the password matches what was set during registration', 'cyan');
    log('   3. If you forgot the password, you can:', 'cyan');
    log('      - Create a new test user: npm run test:login', 'cyan');
    log('      - Or reset the password in the database', 'cyan');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    if (error.stack) {
      log(`   Stack: ${error.stack}`, 'red');
    }
    process.exit(1);
  }
}

listUsers();

