#!/usr/bin/env node
/**
 * Test Login Script
 * Creates a test user and tests login functionality
 */

require('dotenv').config();
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpass123'
};

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

async function createTestUser() {
  log('\n📝 Creating test user...', 'cyan');
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ Missing Supabase configuration', 'red');
    log('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗', 'yellow');
    log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗', 'yellow');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const checkUrl = `${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(TEST_USER.username)}&select=id,username,email&limit=1`;
    const checkResponse = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (checkResponse.ok) {
      const existingUsers = await checkResponse.json();
      if (existingUsers && existingUsers.length > 0) {
        log(`⚠️  User "${TEST_USER.username}" already exists (ID: ${existingUsers[0].id})`, 'yellow');
        log('   Deleting existing user...', 'yellow');
        
        // Delete existing user
        const deleteUrl = `${supabaseUrl}/rest/v1/users?id=eq.${existingUsers[0].id}`;
        await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        });
        log('   ✓ Existing user deleted', 'green');
      }
    }

    // Hash password
    log('   Hashing password...', 'cyan');
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 8);
    log('   ✓ Password hashed', 'green');

    // Create user
    log('   Inserting user into database...', 'cyan');
    const insertUrl = `${supabaseUrl}/rest/v1/users`;
    const insertResponse = await fetch(insertUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        username: TEST_USER.username,
        email: TEST_USER.email,
        password: hashedPassword,
      }),
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      throw new Error(`Failed to create user: ${insertResponse.status} - ${errorText}`);
    }

    const newUser = await insertResponse.json();
    log(`✅ Test user created successfully!`, 'green');
    log(`   ID: ${newUser[0]?.id || newUser.id}`, 'cyan');
    log(`   Username: ${TEST_USER.username}`, 'cyan');
    log(`   Email: ${TEST_USER.email}`, 'cyan');
    
    return newUser[0] || newUser;
  } catch (error) {
    log(`❌ Error creating user: ${error.message}`, 'red');
    if (error.stack) {
      log(`   Stack: ${error.stack}`, 'red');
    }
    throw error;
  }
}

async function testLogin() {
  log('\n🔐 Testing login...', 'cyan');
  
  try {
    log(`   Sending login request to: ${API_URL}/auth?action=login`, 'cyan');
    log(`   Username: ${TEST_USER.username}`, 'cyan');
    
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
      log(`   Response:`, 'cyan');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.user) {
        log(`\n✅ User authenticated:`, 'green');
        log(`   User ID: ${data.user.id}`, 'cyan');
        log(`   Username: ${data.user.username}`, 'cyan');
        log(`   Email: ${data.user.email}`, 'cyan');
        log(`   Token: ${data.token}`, 'cyan');
      }
      
      return true;
    } else {
      log('\n❌ Login failed!', 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Response:`, 'red');
      console.log(JSON.stringify(data, null, 2));
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

async function testDirectQuery() {
  log('\n🔍 Testing direct database query...', 'cyan');
  
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
      log('   ❌ No user found in database', 'red');
      return false;
    }

    log(`   ✅ User found in database!`, 'green');
    log(`   ID: ${users[0].id}`, 'cyan');
    log(`   Username: ${users[0].username}`, 'cyan');
    log(`   Email: ${users[0].email}`, 'cyan');
    log(`   Password hash: ${users[0].password.substring(0, 20)}...`, 'cyan');

    // Test password comparison
    log(`   Testing password comparison...`, 'cyan');
    const isMatch = await bcrypt.compare(TEST_USER.password, users[0].password);
    
    if (isMatch) {
      log(`   ✅ Password matches!`, 'green');
    } else {
      log(`   ❌ Password does NOT match!`, 'red');
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

async function main() {
  log('🧪 Digital Diary - Login Test Script', 'blue');
  log('=====================================\n', 'blue');

  try {
    // Step 1: Create test user
    await createTestUser();

    // Step 2: Test direct database query
    const querySuccess = await testDirectQuery();
    
    if (!querySuccess) {
      log('\n⚠️  Direct query failed, but continuing with login test...', 'yellow');
    }

    // Step 3: Test login via API
    const loginSuccess = await testLogin();

    // Summary
    log('\n📊 Test Summary', 'blue');
    log('=====================================', 'blue');
    log(`User Creation: ✅`, 'green');
    log(`Direct Query: ${querySuccess ? '✅' : '❌'}`, querySuccess ? 'green' : 'red');
    log(`Login Test: ${loginSuccess ? '✅' : '❌'}`, loginSuccess ? 'green' : 'red');
    
    if (loginSuccess) {
      log('\n✅ All tests passed!', 'green');
      process.exit(0);
    } else {
      log('\n❌ Login test failed. Check the errors above.', 'red');
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

