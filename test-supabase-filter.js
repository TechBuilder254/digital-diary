/**
 * Test Supabase Filter Format Directly
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

async function testFilter() {
  console.log('=== Testing Supabase Filter Format ===\n');
  
  const testUserId = 11;
  
  // Test 1: Using Supabase JS client with .eq()
  console.log('Test 1: Using Supabase JS client .eq() filter');
  const { data: jsClientData, error: jsError } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', testUserId);
  
  if (jsError) {
    console.error('  ❌ Error:', jsError.message);
  } else {
    console.log(`  ✅ Found ${jsClientData?.length || 0} entries for user ${testUserId}`);
    if (jsClientData) {
      jsClientData.forEach(e => {
        console.log(`     - Entry ${e.id}: user_id=${e.user_id}, title="${e.title?.substring(0, 30)}"`);
      });
    }
  }
  
  // Test 2: Using REST API with filter format
  console.log('\nTest 2: Using REST API with user_id=eq.11 filter');
  const restUrl = `${supabaseUrl}/rest/v1/entries?user_id=eq.11&select=*`;
  console.log(`  URL: ${restUrl.substring(0, 80)}...`);
  
  try {
    const response = await fetch(restUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  ❌ HTTP ${response.status}: ${errorText}`);
    } else {
      const data = await response.json();
      console.log(`  ✅ Found ${Array.isArray(data) ? data.length : 0} entries`);
      if (Array.isArray(data)) {
        data.forEach(e => {
          console.log(`     - Entry ${e.id}: user_id=${e.user_id}, title="${e.title?.substring(0, 30)}"`);
        });
      }
    }
  } catch (error) {
    console.error('  ❌ Fetch error:', error.message);
  }
  
  // Test 3: Test with different user_id values
  console.log('\nTest 3: Testing filter with different user_id values');
  for (const uid of [1, 9, 10, 11]) {
    const { data } = await supabase
      .from('entries')
      .select('id, user_id, title')
      .eq('user_id', uid);
    
    console.log(`  User ${uid}: ${data?.length || 0} entries`);
  }
  
  // Test 4: Test the exact filter format we're using
  console.log('\nTest 4: Testing exact filter format from fastQuery');
  const testFilters = { 'user_id': testUserId };
  const params = new URLSearchParams();
  Object.entries(testFilters).forEach(([key, value]) => {
    const filterString = `eq.${encodeURIComponent(value)}`;
    params.append(key, filterString);
    console.log(`  Filter: ${key}=${filterString}`);
  });
  
  const testUrl = `${supabaseUrl}/rest/v1/entries?${params.toString()}&select=*`;
  console.log(`  Full URL: ${testUrl.substring(0, 100)}...`);
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  ❌ HTTP ${response.status}: ${errorText}`);
    } else {
      const data = await response.json();
      console.log(`  ✅ Found ${Array.isArray(data) ? data.length : 0} entries`);
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(e => {
          console.log(`     - Entry ${e.id}: user_id=${e.user_id} (type: ${typeof e.user_id})`);
        });
      }
    }
  } catch (error) {
    console.error('  ❌ Fetch error:', error.message);
  }
}

testFilter()
  .then(() => {
    console.log('\n=== Test Complete ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

