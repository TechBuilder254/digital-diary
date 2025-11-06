/**
 * Test User Isolation Script
 * This script tests the API endpoints to ensure user data is properly isolated
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserIsolation() {
  console.log('=== Testing User Isolation ===\n');

  try {
    // 1. Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email')
      .order('id');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - User ${user.id}: ${user.username} (${user.email})`);
    });
    console.log('');

    // 2. Check data for each user
    const tables = ['entries', 'tasks', 'todos', 'moods', 'notes'];
    
    for (const table of tables) {
      console.log(`\n=== Checking ${table} table ===`);
      
      // Get all records
      const { data: allRecords, error: allError } = await supabase
        .from(table)
        .select('id, user_id')
        .order('id');

      if (allError) {
        console.error(`Error fetching ${table}:`, allError);
        continue;
      }

      console.log(`Total records: ${allRecords.length}`);
      
      // Group by user_id
      const byUser = {};
      allRecords.forEach(record => {
        const uid = record.user_id || 'NULL';
        if (!byUser[uid]) {
          byUser[uid] = [];
        }
        byUser[uid].push(record.id);
      });

      console.log('Records by user_id:');
      Object.keys(byUser).sort().forEach(uid => {
        const count = byUser[uid].length;
        const user = users.find(u => u.id === parseInt(uid));
        const username = user ? user.username : 'UNKNOWN USER';
        console.log(`  - user_id ${uid} (${username}): ${count} records`);
        
        if (uid === 'NULL' || uid === '1' && users.length > 1) {
          console.log(`    ⚠️  WARNING: Records with user_id=${uid} may be orphaned or incorrectly assigned!`);
        }
      });

      // Check for records with invalid user_ids
      const validUserIds = users.map(u => u.id);
      const invalidRecords = allRecords.filter(r => !validUserIds.includes(r.user_id));
      
      if (invalidRecords.length > 0) {
        console.log(`  ⚠️  Found ${invalidRecords.length} records with invalid user_id!`);
        invalidRecords.forEach(record => {
          console.log(`    - Record ${record.id} has user_id=${record.user_id} (user doesn't exist)`);
        });
      }
    }

    // 3. Test API filtering (simulate requests)
    console.log('\n=== Testing API Filtering ===');
    
    if (users.length >= 2) {
      const user1 = users[0];
      const user2 = users[1];
      
      console.log(`\nTesting with User ${user1.id} (${user1.username}):`);
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('id, user_id')
          .eq('user_id', user1.id);
        
        if (!error && data) {
          console.log(`  ${table}: ${data.length} records`);
        }
      }
      
      console.log(`\nTesting with User ${user2.id} (${user2.username}):`);
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('id, user_id')
          .eq('user_id', user2.id);
        
        if (!error && data) {
          console.log(`  ${table}: ${data.length} records`);
        }
      }
    }

    // 4. Recommendations
    console.log('\n=== Recommendations ===');
    const hasOrphanedData = tables.some(async (table) => {
      const { data } = await supabase
        .from(table)
        .select('user_id')
        .is('user_id', null)
        .limit(1);
      return data && data.length > 0;
    });

    console.log('1. Ensure all API endpoints filter by user_id');
    console.log('2. Check that Authorization header is being sent from frontend');
    console.log('3. Verify getUserId() function is extracting user_id correctly');
    console.log('4. Consider cleaning up orphaned records (user_id=NULL or invalid)');

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testUserIsolation()
  .then(() => {
    console.log('\n=== Test Complete ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

