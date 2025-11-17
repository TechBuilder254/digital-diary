#!/usr/bin/env node
/**
 * Test Login for user "jes"
 */

require('dotenv').config();
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TEST_USER = {
  username: 'jes',
  password: '12345678'
};

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

async function testDirectQuery() {
  log('\n🔍 Testing direct database query for user "jes"...', 'cyan');
  
  try {
    const { fastQuery } = require('../lib/supabase-rest');
    
    log(`   Querying users table for username: "${TEST_USER.username}"`, 'cyan');
    const users = await fastQuery('users', {
      filters: { 'username': TEST_USER.username },
      select: 'id,username,email,password',
      limit: 1,
      timeout: 2000
    });

    if (!users || users.length === 0) {
      log('   ❌ No user found in database with username "jes"', 'red');
      log('   💡 Check if the username is correct (case-sensitive)', 'yellow');
      return false;
    }

    log(`   ✅ User found in database!`, 'green');
    log(`   ID: ${users[0].id}`, 'cyan');
    log(`   Username: ${users[0].username}`, 'cyan');
    log(`   Email: ${users[0].email}`, 'cyan');
    log(`   Password hash: ${users[0].password ? users[0].password.substring(0, 30) + '...' : 'NULL'}`, 'cyan');

    if (!users[0].password) {
      log('   ❌ User has no password hash!', 'red');
      return false;
    }

    // Test password comparison
    log(`   Testing password comparison with "12345678"...`, 'cyan');
    const isMatch = await bcrypt.compare(TEST_USER.password, users[0].password);
    
    if (isMatch) {
      log(`   ✅ Password matches!`, 'green');
    } else {
      log(`   ❌ Password does NOT match!`, 'red');
      log(`   💡 The stored password hash does not match "12345678"`, 'yellow');
      log(`   💡 The user may have been created with a different password`, 'yellow');
    }
    
    return isMatch;
  } catch (error) {
    log(`   ❌ Query error: ${error.message}`, 'red');
    if (error.stack) {
      log(`   Stack: ${error.stack}`, 'red');
    }
    return false;
  }
}

async function testLogin() {
  log('\n🔐 Testing login via API...', 'cyan');
  
  try {
    log(`   Sending login request to: ${API_URL}/auth?action=login`, 'cyan');
    log(`   Username: ${TEST_USER.username}`, 'cyan');
    log(`   Password: ${TEST_USER.password}`, 'cyan');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_URL}/auth?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: TEST_USER.username,
        password: TEST_USER.password,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (response.ok && data.success) {
      log('\n✅ Login successful!', 'green');
      log(`   Status: ${response.status}`, 'cyan');
      log(`   User ID: ${data.user?.id}`, 'cyan');
      log(`   Username: ${data.user?.username}`, 'cyan');
      log(`   Email: ${data.user?.email}`, 'cyan');
      return true;
    } else {
      log('\n❌ Login failed!', 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Message: ${data.message || 'Unknown error'}`, 'red');
      if (data.error) {
        log(`   Error: ${data.error}`, 'red');
      }
      return false;
    }
  } catch (error) {
    log('\n❌ Login failed!', 'red');
    
    if (error.name === 'AbortError') {
      log(`   Request timeout`, 'red');
      log(`   Make sure the API server is running on ${API_URL}`, 'yellow');
    } else {
      log(`   Error: ${error.message}`, 'red');
      if (error.stack) {
        log(`   Stack: ${error.stack}`, 'red');
      }
    }
    
    return false;
  }
}

async function main() {
  log('🧪 Testing Login for user "jes"', 'blue');
  log('=====================================\n', 'blue');

  try {
    // Step 1: Test direct database query
    const querySuccess = await testDirectQuery();
    
    if (!querySuccess) {
      log('\n⚠️  Direct query failed. Password hash does not match.', 'yellow');
      log('💡 Solution: Reset the password for user "jes"', 'yellow');
    }

    // Step 2: Test login via API
    const loginSuccess = await testLogin();

    // Summary
    log('\n📊 Test Summary', 'blue');
    log('=====================================', 'blue');
    log(`Direct Query: ${querySuccess ? '✅' : '❌'}`, querySuccess ? 'green' : 'red');
    log(`Login Test: ${loginSuccess ? '✅' : '❌'}`, loginSuccess ? 'green' : 'red');
    
    if (loginSuccess) {
      log('\n✅ Login works!', 'green');
      process.exit(0);
    } else {
      log('\n❌ Login failed. The password "12345678" does not match the stored hash.', 'red');
      log('💡 You need to reset the password for user "jes"', 'yellow');
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    if (error.stack) {
      log(`Stack: ${error.stack}`, 'red');
    }
    process.exit(1);
  }
}

main();

