/**
 * Complete End-to-End Test: Account Creation → Login → Data Isolation
 * Tests the full flow from registration to data access
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const url = `http://localhost:3000${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function testCompleteFlow() {
  console.log('=== Complete End-to-End User Isolation Test ===\n');

  try {
    // Step 1: Create a new test user
    console.log('Step 1: Creating new test user...');
    const testUsername = `testuser_${Date.now()}`;
    const testEmail = `${testUsername}@test.com`;
    const testPassword = 'TestPassword123!';
    
    const hashedPassword = await bcrypt.hash(testPassword, 8);
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        username: testUsername,
        email: testEmail,
        password: hashedPassword
      }])
      .select()
      .single();
    
    if (createError || !newUser) {
      console.error('❌ Failed to create user:', createError);
      return;
    }
    
    console.log(`✅ Created user: ${newUser.username} (ID: ${newUser.id})\n`);

    // Step 2: Login via API (simulate frontend login)
    console.log('Step 2: Logging in via API...');
    const loginResponse = await apiCall('/api/auth?action=login', 'POST', {
      action: 'login',
      username: testUsername,
      password: testPassword
    });
    
    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log(`✅ Login successful!`);
    console.log(`   Token: ${token}`);
    console.log(`   User ID: ${user.id}\n`);

    // Step 3: Create test data for this user
    console.log('Step 3: Creating test data for user...');
    
    // Create an entry
    const entryResponse = await apiCall('/api/entries', 'POST', {
      title: `Test Entry for ${testUsername}`,
      content: 'This is a test entry created during isolation testing',
      user_id: parseInt(user.id)
    }, token);
    
    if (entryResponse.status === 201) {
      console.log(`✅ Created entry: ${entryResponse.data.id}`);
    } else {
      console.log(`⚠️  Entry creation: ${entryResponse.status} - ${JSON.stringify(entryResponse.data)}`);
    }
    
    // Create a task
    const taskResponse = await apiCall('/api/tasks', 'POST', {
      title: `Test Task for ${testUsername}`,
      description: 'Test task description',
      deadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      user_id: parseInt(user.id)
    }, token);
    
    if (taskResponse.status === 201) {
      console.log(`✅ Created task: ${taskResponse.data.id}`);
    } else {
      console.log(`⚠️  Task creation: ${taskResponse.status} - ${JSON.stringify(taskResponse.data)}`);
    }
    
    // Create a note
    const noteResponse = await apiCall('/api/notes', 'POST', {
      title: `Test Note for ${testUsername}`,
      content: 'This is a test note',
      user_id: parseInt(user.id)
    }, token);
    
    if (noteResponse.status === 201) {
      console.log(`✅ Created note: ${noteResponse.data.id}`);
    } else {
      console.log(`⚠️  Note creation: ${noteResponse.status} - ${JSON.stringify(noteResponse.data)}`);
    }
    
    console.log('');

    // Step 4: Fetch data with token (should only get this user's data)
    console.log('Step 4: Fetching data with Authorization token...');
    
    const entriesResponse = await apiCall('/api/entries', 'GET', null, token);
    const tasksResponse = await apiCall('/api/tasks', 'GET', null, token);
    const notesResponse = await apiCall('/api/notes', 'GET', null, token);
    
    console.log(`   Entries: ${entriesResponse.status} - Found ${Array.isArray(entriesResponse.data) ? entriesResponse.data.length : 0} entries`);
    console.log(`   Tasks: ${tasksResponse.status} - Found ${Array.isArray(tasksResponse.data) ? tasksResponse.data.length : 0} tasks`);
    console.log(`   Notes: ${notesResponse.status} - Found ${Array.isArray(notesResponse.data) ? notesResponse.data.length : 0} notes`);
    
    // Verify all returned data belongs to this user
    let allDataCorrect = true;
    
    if (Array.isArray(entriesResponse.data)) {
      const wrongEntries = entriesResponse.data.filter(e => e.user_id !== parseInt(user.id));
      if (wrongEntries.length > 0) {
        console.log(`   ❌ Found ${wrongEntries.length} entries with wrong user_id!`);
        allDataCorrect = false;
      } else {
        console.log(`   ✅ All entries belong to user ${user.id}`);
      }
    }
    
    if (Array.isArray(tasksResponse.data)) {
      const wrongTasks = tasksResponse.data.filter(t => t.user_id !== parseInt(user.id));
      if (wrongTasks.length > 0) {
        console.log(`   ❌ Found ${wrongTasks.length} tasks with wrong user_id!`);
        allDataCorrect = false;
      } else {
        console.log(`   ✅ All tasks belong to user ${user.id}`);
      }
    }
    
    if (Array.isArray(notesResponse.data)) {
      const wrongNotes = notesResponse.data.filter(n => n.user_id !== parseInt(user.id));
      if (wrongNotes.length > 0) {
        console.log(`   ❌ Found ${wrongNotes.length} notes with wrong user_id!`);
        allDataCorrect = false;
      } else {
        console.log(`   ✅ All notes belong to user ${user.id}`);
      }
    }
    
    console.log('');

    // Step 5: Test with query params (fallback method)
    console.log('Step 5: Testing with user_id query param (fallback)...');
    const entriesWithParam = await apiCall(`/api/entries?user_id=${user.id}`, 'GET', null, null);
    console.log(`   Entries with query param: ${entriesWithParam.status} - Found ${Array.isArray(entriesWithParam.data) ? entriesWithParam.data.length : 0} entries`);
    
    if (Array.isArray(entriesWithParam.data)) {
      const wrongEntries = entriesWithParam.data.filter(e => e.user_id !== parseInt(user.id));
      if (wrongEntries.length > 0) {
        console.log(`   ❌ Query param method found wrong entries!`);
        allDataCorrect = false;
      } else {
        console.log(`   ✅ Query param method works correctly`);
      }
    }
    
    console.log('');

    // Step 6: Test without authentication (should fail or return empty)
    console.log('Step 6: Testing without authentication...');
    const noAuthResponse = await apiCall('/api/entries', 'GET', null, null);
    if (noAuthResponse.status === 401) {
      console.log(`   ✅ Correctly rejected unauthenticated request (401)`);
    } else if (Array.isArray(noAuthResponse.data) && noAuthResponse.data.length === 0) {
      console.log(`   ✅ Correctly returned empty array for unauthenticated request`);
    } else {
      console.log(`   ⚠️  Unauthenticated request returned data: ${noAuthResponse.status}`);
      allDataCorrect = false;
    }
    
    console.log('');

    // Step 7: Verify database directly
    console.log('Step 7: Verifying database directly...');
    const { data: dbEntries } = await supabase
      .from('entries')
      .select('id, user_id, title')
      .eq('user_id', parseInt(user.id));
    
    const { data: dbTasks } = await supabase
      .from('tasks')
      .select('id, user_id, title')
      .eq('user_id', parseInt(user.id));
    
    const { data: dbNotes } = await supabase
      .from('notes')
      .select('id, user_id, title')
      .eq('user_id', parseInt(user.id));
    
    console.log(`   Database entries for user ${user.id}: ${dbEntries?.length || 0}`);
    console.log(`   Database tasks for user ${user.id}: ${dbTasks?.length || 0}`);
    console.log(`   Database notes for user ${user.id}: ${dbNotes?.length || 0}`);
    
    // Compare API results with database
    const apiEntriesCount = Array.isArray(entriesResponse.data) ? entriesResponse.data.length : 0;
    const dbEntriesCount = dbEntries?.length || 0;
    
    if (apiEntriesCount === dbEntriesCount) {
      console.log(`   ✅ API and database counts match for entries`);
    } else {
      console.log(`   ⚠️  API returned ${apiEntriesCount} entries, database has ${dbEntriesCount}`);
    }
    
    console.log('');

    // Final Summary
    console.log('=== Test Summary ===');
    if (allDataCorrect && entriesResponse.status === 200) {
      console.log('✅ PASS: User isolation is working correctly!');
      console.log(`   - User ${user.id} (${testUsername}) can only see their own data`);
      console.log(`   - Authorization token is being extracted correctly`);
      console.log(`   - API endpoints are filtering by user_id`);
    } else {
      console.log('❌ FAIL: User isolation has issues');
      console.log('   Check the logs above for details');
    }
    
    console.log('\n=== Cleanup ===');
    console.log(`Test user created: ${testUsername} (ID: ${user.id})`);
    console.log('You can delete this user manually if needed:');
    console.log(`  DELETE FROM users WHERE id = ${user.id};`);
    console.log('(This will cascade delete all their data)');

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username: 'test', password: 'test' })
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Run the test
console.log('Checking if server is running on localhost:3000...');
checkServer().then(serverRunning => {
  if (!serverRunning) {
    console.error('❌ Server is not running on localhost:3000');
    console.error('Please start the server first:');
    console.error('  npm start  (or node server-dev.js)');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  testCompleteFlow()
    .then(() => {
      console.log('\n=== Test Complete ===');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
});

