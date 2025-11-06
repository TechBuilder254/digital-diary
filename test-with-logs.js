/**
 * Test API with full logging to see what's happening
 */

const http = require('http');

function testWithLogs() {
  return new Promise((resolve, reject) => {
    const token = 'jwt-token-11';
    
    const options = {
      hostname: 'localhost',
      port: 5000, // server-dev.js uses port 5000
      path: '/api/entries',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('=== Making API Request ===');
    console.log('URL: http://localhost:5000/api/entries');
    console.log('Authorization:', `Bearer ${token}`);
    console.log('\nWatch the SERVER console for logs!');
    console.log('You should see:');
    console.log('  [Server] Found Authorization header');
    console.log('  [getUserId] Extracted user_id from token: 11');
    console.log('  [Entries GET] Querying entries for user_id: 11');
    console.log('  [fastQuery] Added filter: user_id=eq.11');
    console.log('  [Entries GET] Returning 1 entries for user 11');
    console.log('\nMaking request...\n');

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('=== Response ===');
          console.log('Status:', res.statusCode);
          
          if (Array.isArray(parsed)) {
            console.log(`Found ${parsed.length} entries:`);
            parsed.forEach((entry, i) => {
              console.log(`  ${i + 1}. ID: ${entry.id}, user_id: ${entry.user_id}, title: "${entry.title?.substring(0, 40)}"`);
            });
            
            // Check if all belong to user 11
            const wrongEntries = parsed.filter(e => e.user_id !== 11);
            if (wrongEntries.length > 0) {
              console.log(`\n❌ ERROR: Found ${wrongEntries.length} entries that don't belong to user 11!`);
              console.log('This means the filter is NOT working.');
            } else {
              console.log(`\n✅ SUCCESS: All ${parsed.length} entries belong to user 11!`);
            }
          } else {
            console.log('Response:', parsed);
          }
          resolve(parsed);
        } catch (e) {
          console.log('Raw response:', data);
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.end();
  });
}

testWithLogs()
  .then(() => {
    console.log('\n=== Test Complete ===');
    console.log('\nIf you saw wrong entries, check the SERVER console logs');
    console.log('to see if getUserId extracted the user_id correctly.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

