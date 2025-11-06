/**
 * Direct API Test - Test the API endpoint directly to see logs
 */

const http = require('http');

function testAPI() {
  return new Promise((resolve, reject) => {
    const token = 'jwt-token-11';
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/entries',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('Making request with token:', token);
    console.log('Headers:', options.headers);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('\n=== Response ===');
          console.log('Status:', res.statusCode);
          console.log('Data length:', Array.isArray(parsed) ? parsed.length : 'not array');
          if (Array.isArray(parsed)) {
            console.log('Entries:');
            parsed.forEach((entry, i) => {
              console.log(`  ${i + 1}. ID: ${entry.id}, user_id: ${entry.user_id}, title: ${entry.title?.substring(0, 30)}`);
            });
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

console.log('=== Direct API Test ===\n');
testAPI()
  .then(() => {
    console.log('\n=== Test Complete ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

