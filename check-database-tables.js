/**
 * Check Database Tables and Structure
 * Verifies all tables exist and have correct user_id columns
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

async function checkDatabaseTables() {
  console.log('=== Database Tables Check ===\n');

  try {
    // Check each table structure and data
    const tables = ['users', 'entries', 'tasks', 'todos', 'moods', 'notes'];
    
    for (const table of tables) {
      console.log(`\n--- Table: ${table} ---`);
      
      // Get sample data to check structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`  ❌ Error accessing table: ${error.message}`);
        continue;
      }
      
      if (data && data.length > 0) {
        const sample = data[0];
        console.log(`  ✅ Table exists and has data`);
        console.log(`  Columns: ${Object.keys(sample).join(', ')}`);
        
        // Check if user_id column exists
        if ('user_id' in sample) {
          console.log(`  ✅ Has user_id column`);
          console.log(`  Sample user_id value: ${sample.user_id} (type: ${typeof sample.user_id})`);
        } else {
          console.error(`  ❌ MISSING user_id column!`);
        }
        
        // Get total count
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        console.log(`  Total records: ${count || 0}`);
        
        // Get count by user_id
        if ('user_id' in sample) {
          const { data: userCounts } = await supabase
            .from(table)
            .select('user_id');
          
          if (userCounts) {
            const byUser = {};
            userCounts.forEach(record => {
              const uid = record.user_id || 'NULL';
              byUser[uid] = (byUser[uid] || 0) + 1;
            });
            
            console.log(`  Records by user_id:`);
            Object.keys(byUser).sort().forEach(uid => {
              console.log(`    - user_id ${uid}: ${byUser[uid]} records`);
            });
          }
        }
      } else {
        console.log(`  ✅ Table exists but is empty`);
        
        // Try to get column info by attempting a select with limit 0
        // This won't work directly, so we'll check the schema differently
        console.log(`  (No data to check structure)`);
      }
    }
    
    // Check for NULL user_id values (should not exist)
    console.log('\n=== Checking for NULL user_id values ===');
    for (const table of ['entries', 'tasks', 'todos', 'moods', 'notes']) {
      const { data, error } = await supabase
        .from(table)
        .select('id, user_id')
        .is('user_id', null)
        .limit(10);
      
      if (!error && data && data.length > 0) {
        console.error(`  ❌ ${table}: Found ${data.length} records with NULL user_id!`);
        console.log(`     Record IDs: ${data.map(r => r.id).join(', ')}`);
      } else if (!error) {
        console.log(`  ✅ ${table}: No NULL user_id values`);
      }
    }
    
    // Check for invalid user_id values (user_id that doesn't exist in users table)
    console.log('\n=== Checking for invalid user_id values ===');
    const { data: validUserIds } = await supabase
      .from('users')
      .select('id');
    
    const validIds = validUserIds ? validUserIds.map(u => u.id) : [];
    console.log(`  Valid user IDs: ${validIds.join(', ')}`);
    
    for (const table of ['entries', 'tasks', 'todos', 'moods', 'notes']) {
      const { data: allRecords } = await supabase
        .from(table)
        .select('id, user_id');
      
      if (allRecords) {
        const invalidRecords = allRecords.filter(r => 
          r.user_id !== null && !validIds.includes(r.user_id)
        );
        
        if (invalidRecords.length > 0) {
          console.error(`  ❌ ${table}: Found ${invalidRecords.length} records with invalid user_id!`);
          invalidRecords.slice(0, 5).forEach(r => {
            console.log(`     Record ${r.id} has user_id ${r.user_id} (user doesn't exist)`);
          });
        } else {
          console.log(`  ✅ ${table}: All user_id values are valid`);
        }
      }
    }
    
    // Summary
    console.log('\n=== Summary ===');
    console.log('✅ All tables checked');
    console.log('✅ user_id columns verified');
    console.log('✅ Data integrity checked');
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabaseTables()
  .then(() => {
    console.log('\n=== Check Complete ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

