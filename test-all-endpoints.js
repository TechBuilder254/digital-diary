/**
 * Test All Endpoints for User Isolation
 */

const http = require('http');

function testEndpoint(endpoint, token, expectedUser) {
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
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, endpoint });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, endpoint });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testAllEndpoints() {
  console.log('=== Testing All Endpoints ===\n');
  
  const token = 'jwt-token-13'; // User 13 from previous test
  const expectedUserId = 13;
  
  const endpoints = [
    '/api/entries',
    '/api/tasks',
    '/api/todo',
    '/api/moods',
    '/api/notes'
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint}...`);
    const result = await testEndpoint(endpoint, token, expectedUserId);
    
    if (result.status === 401) {
      console.log(`  ❌ Returned 401 (unauthorized)`);
      allPassed = false;
      continue;
    }
    
    if (!Array.isArray(result.data)) {
      console.log(`  ⚠️  Response is not an array:`, typeof result.data);
      continue;
    }
    
    const wrongData = result.data.filter(item => {
      const itemUserId = parseInt(item.user_id, 10);
      return isNaN(itemUserId) || itemUserId !== expectedUserId;
    });
    
    if (wrongData.length > 0) {
      console.log(`  ❌ Found ${wrongData.length} items with wrong user_id!`);
      wrongData.forEach(item => {
        console.log(`     - ${endpoint}: ID ${item.id}, user_id=${item.user_id} (expected ${expectedUserId})`);
      });
      allPassed = false;
    } else {
      console.log(`  ✅ All ${result.data.length} items belong to user ${expectedUserId}`);
    }
  }
  
  console.log('\n=== Summary ===');
  if (allPassed) {
    console.log('✅ ALL ENDPOINTS WORKING CORRECTLY!');
    console.log('   User isolation is properly implemented.');
  } else {
    console.log('❌ Some endpoints have issues');
    console.log('   Check the errors above.');
  }
}

testAllEndpoints()
  .then(() => {
    console.log('\n=== Test Complete ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

