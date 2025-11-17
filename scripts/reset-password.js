#!/usr/bin/env node
/**
 * Reset Password Script
 * Resets password for a user
 */

require('dotenv').config();
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const USERNAME = process.argv[2] || 'jes';
const NEW_PASSWORD = process.argv[3] || '12345678';

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

async function resetPassword() {
  log('\n🔐 Resetting password...', 'cyan');
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ Missing Supabase configuration', 'red');
    process.exit(1);
  }

  try {
    // Find user
    log(`   Looking for user: "${USERNAME}"`, 'cyan');
    const { fastQuery } = require('../lib/supabase-rest');
    
    const users = await fastQuery('users', {
      filters: { 'username': USERNAME },
      select: 'id,username,email',
      limit: 1,
      timeout: 2000
    });

    if (!users || users.length === 0) {
      log(`   ❌ User "${USERNAME}" not found`, 'red');
      process.exit(1);
    }

    const user = users[0];
    log(`   ✅ User found (ID: ${user.id})`, 'green');

    // Hash new password
    log(`   Hashing new password...`, 'cyan');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 8);
    log(`   ✅ Password hashed`, 'green');

    // Update password
    log(`   Updating password in database...`, 'cyan');
    const updateUrl = `${supabaseUrl}/rest/v1/users?id=eq.${user.id}`;
    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        password: hashedPassword,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update password: ${response.status} - ${errorText}`);
    }

    log(`\n✅ Password reset successful!`, 'green');
    log(`   Username: ${user.username}`, 'cyan');
    log(`   Email: ${user.email}`, 'cyan');
    log(`   New password: ${NEW_PASSWORD}`, 'cyan');
    log(`\n💡 You can now login with username "${USERNAME}" and password "${NEW_PASSWORD}"`, 'yellow');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    if (error.stack) {
      log(`   Stack: ${error.stack}`, 'red');
    }
    process.exit(1);
  }
}

resetPassword();

