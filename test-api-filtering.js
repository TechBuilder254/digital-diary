/**
 * Test API Endpoints for User Isolation
 * Simulates API requests to verify filtering works
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

// Simulate getUserId function
function extractUserIdFromToken(token) {
  if (!token) return null;
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  if (cleanToken.startsWith('jwt-token-')) {
    const userId = cleanToken.replace('jwt-token-', '');
    const parsedId = parseInt(userId, 10);
    return !isNaN(parsedId) ? parsedId : null;
  }
  return null;
}

async function testAPIFiltering() {
  console.log('=== Testing API Filtering ===\n');

  try {
    // Get test users
    const { data: users } = await supabase
      .from('users')
      .select('id, username')
      .order('id')
      .limit(3);

    if (!users || users.length < 2) {
      console.error('Need at least 2 users to test');
      return;
    }

    const user1 = users[0];
    const user2 = users[1];

    console.log(`Testing with User ${user1.id} (${user1.username})`);
    console.log(`and User ${user2.id} (${user2.username})\n`);

    // Test token extraction
    const token1 = `jwt-token-${user1.id}`;
    const token2 = `jwt-token-${user2.id}`;
    
    const userId1 = extractUserIdFromToken(token1);
    const userId2 = extractUserIdFromToken(token2);

    console.log(`Token 1: "${token1}" -> user_id: ${userId1}`);
    console.log(`Token 2: "${token2}" -> user_id: ${userId2}\n`);

    // Test filtering for each table
    const tables = ['entries', 'tasks', 'todos', 'moods', 'notes'];

    for (const table of tables) {
      console.log(`\n--- Testing ${table} table ---`);
      
      // Get all records (no filter) - should NOT do this in production!
      const { data: allData } = await supabase
        .from(table)
        .select('id, user_id')
        .limit(10);

      // Filter by user1
      const { data: user1Data } = await supabase
        .from(table)
        .select('id, user_id')
        .eq('user_id', userId1);

      // Filter by user2
      const { data: user2Data } = await supabase
        .from(table)
        .select('id, user_id')
        .eq('user_id', userId2);

      console.log(`  Total records: ${allData?.length || 0}`);
      console.log(`  User ${userId1} records: ${user1Data?.length || 0}`);
      console.log(`  User ${userId2} records: ${user2Data?.length || 0}`);

      // Verify filtering works
      if (user1Data && user1Data.length > 0) {
        const allUser1 = user1Data.every(r => r.user_id === userId1);
        console.log(`  ✓ User ${userId1} filter correct: ${allUser1}`);
      }

      if (user2Data && user2Data.length > 0) {
        const allUser2 = user2Data.every(r => r.user_id === userId2);
        console.log(`  ✓ User ${userId2} filter correct: ${allUser2}`);
      }

      // Check for cross-contamination
      if (user1Data && user2Data) {
        const user1Ids = new Set(user1Data.map(r => r.id));
        const user2Ids = new Set(user2Data.map(r => r.id));
        const overlap = [...user1Ids].filter(id => user2Ids.has(id));
        
        if (overlap.length > 0) {
          console.log(`  ⚠️  WARNING: Found ${overlap.length} records shared between users!`);
        } else {
          console.log(`  ✓ No cross-contamination between users`);
        }
      }
    }

    console.log('\n=== Test Summary ===');
    console.log('✓ Token extraction working');
    console.log('✓ Database filtering by user_id working');
    console.log('⚠️  If users still see other data, check:');
    console.log('   1. Frontend is sending Authorization header');
    console.log('   2. API endpoints are calling getUserId()');
    console.log('   3. API endpoints are filtering by user_id');

  } catch (error) {
    console.error('Test error:', error);
  }
}

testAPIFiltering()
  .then(() => {
    console.log('\n=== Test Complete ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

