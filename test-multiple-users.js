/**
 * Test Multiple Users - Verify they can't see each other's data
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const http = require('http');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function apiCall(endpoint, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testMultipleUsers() {
  console.log('=== Testing Multiple Users Isolation ===\n');

  try {
    // Create two test users
    console.log('Creating test users...');
    const user1Name = `user1_${Date.now()}`;
    const user2Name = `user2_${Date.now()}`;
    const password = 'TestPass123!';
    
    const hash1 = await bcrypt.hash(password, 8);
    const hash2 = await bcrypt.hash(password, 8);
    
    const { data: user1 } = await supabase
      .from('users')
      .insert([{ username: user1Name, email: `${user1Name}@test.com`, password: hash1 }])
      .select()
      .single();
    
    const { data: user2 } = await supabase
      .from('users')
      .insert([{ username: user2Name, email: `${user2Name}@test.com`, password: hash2 }])
      .select()
      .single();
    
    console.log(`✅ Created User 1: ${user1.username} (ID: ${user1.id})`);
    console.log(`✅ Created User 2: ${user2.username} (ID: ${user2.id})\n`);

    // Login and get tokens
    const login1 = await fetch('http://localhost:5000/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username: user1Name, password })
    });
    const login1Data = await login1.json();
    const token1 = login1Data.token;
    
    const login2 = await fetch('http://localhost:5000/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username: user2Name, password })
    });
    const login2Data = await login2.json();
    const token2 = login2Data.token;
    
    console.log(`✅ User 1 token: ${token1}`);
    console.log(`✅ User 2 token: ${token2}\n`);

    // Create data for User 1
    console.log('Creating data for User 1...');
    await supabase.from('entries').insert([{
      title: 'User 1 Entry',
      content: 'This is User 1 data',
      user_id: user1.id
    }]);
    await supabase.from('tasks').insert([{
      title: 'User 1 Task',
      description: 'User 1 task description',
      deadline: new Date().toISOString(),
      user_id: user1.id
    }]);
    console.log('✅ Created data for User 1\n');

    // Create data for User 2
    console.log('Creating data for User 2...');
    await supabase.from('entries').insert([{
      title: 'User 2 Entry',
      content: 'This is User 2 data',
      user_id: user2.id
    }]);
    await supabase.from('tasks').insert([{
      title: 'User 2 Task',
      description: 'User 2 task description',
      deadline: new Date().toISOString(),
      user_id: user2.id
    }]);
    console.log('✅ Created data for User 2\n');

    // Test User 1 can only see their data
    console.log('=== Testing User 1 Access ===');
    const user1Entries = await apiCall('/api/entries', token1);
    const user1Tasks = await apiCall('/api/tasks', token1);
    
    console.log(`User 1 entries: ${Array.isArray(user1Entries.data) ? user1Entries.data.length : 0}`);
    if (Array.isArray(user1Entries.data)) {
      user1Entries.data.forEach(e => {
        console.log(`  - Entry ${e.id}: user_id=${e.user_id}, title="${e.title}"`);
        if (e.user_id !== user1.id) {
          console.error(`    ❌ ERROR: User 1 sees entry from user ${e.user_id}!`);
        }
      });
    }
    
    console.log(`User 1 tasks: ${Array.isArray(user1Tasks.data) ? user1Tasks.data.length : 0}`);
    if (Array.isArray(user1Tasks.data)) {
      user1Tasks.data.forEach(t => {
        console.log(`  - Task ${t.id}: user_id=${t.user_id}, title="${t.title}"`);
        if (t.user_id !== user1.id) {
          console.error(`    ❌ ERROR: User 1 sees task from user ${t.user_id}!`);
        }
      });
    }

    // Test User 2 can only see their data
    console.log('\n=== Testing User 2 Access ===');
    const user2Entries = await apiCall('/api/entries', token2);
    const user2Tasks = await apiCall('/api/tasks', token2);
    
    console.log(`User 2 entries: ${Array.isArray(user2Entries.data) ? user2Entries.data.length : 0}`);
    if (Array.isArray(user2Entries.data)) {
      user2Entries.data.forEach(e => {
        console.log(`  - Entry ${e.id}: user_id=${e.user_id}, title="${e.title}"`);
        if (e.user_id !== user2.id) {
          console.error(`    ❌ ERROR: User 2 sees entry from user ${e.user_id}!`);
        }
      });
    }
    
    console.log(`User 2 tasks: ${Array.isArray(user2Tasks.data) ? user2Tasks.data.length : 0}`);
    if (Array.isArray(user2Tasks.data)) {
      user2Tasks.data.forEach(t => {
        console.log(`  - Task ${t.id}: user_id=${t.user_id}, title="${t.title}"`);
        if (t.user_id !== user2.id) {
          console.error(`    ❌ ERROR: User 2 sees task from user ${t.user_id}!`);
        }
      });
    }

    // Verify isolation
    console.log('\n=== Isolation Verification ===');
    const user1SeesUser2Data = 
      (Array.isArray(user1Entries.data) && user1Entries.data.some(e => e.user_id === user2.id)) ||
      (Array.isArray(user1Tasks.data) && user1Tasks.data.some(t => t.user_id === user2.id));
    
    const user2SeesUser1Data = 
      (Array.isArray(user2Entries.data) && user2Entries.data.some(e => e.user_id === user1.id)) ||
      (Array.isArray(user2Tasks.data) && user2Tasks.data.some(t => t.user_id === user1.id));

    if (user1SeesUser2Data || user2SeesUser1Data) {
      console.log('❌ FAIL: Users can see each other\'s data!');
      if (user1SeesUser2Data) console.log('  - User 1 can see User 2 data');
      if (user2SeesUser1Data) console.log('  - User 2 can see User 1 data');
    } else {
      console.log('✅ PASS: Users are properly isolated!');
      console.log('  - User 1 only sees their own data');
      console.log('  - User 2 only sees their own data');
    }

    // Cleanup
    console.log('\n=== Cleanup ===');
    console.log(`Test users: ${user1.id} and ${user2.id}`);
    console.log('(Data will be cascade deleted when users are deleted)');

  } catch (error) {
    console.error('Test error:', error);
  }
}

testMultipleUsers()
  .then(() => {
    console.log('\n=== Test Complete ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

