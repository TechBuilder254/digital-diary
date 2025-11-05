/**
 * Test script for auth endpoint
 * Run this to verify the auth handler works correctly
 */

require('dotenv').config();
const authHandler = require('./api/auth/index');

async function testAuth() {
  console.log('🧪 Testing Auth Endpoint\n');

  // Test 1: Login request
  console.log('Test 1: Login request');
  const loginReq = {
    method: 'POST',
    url: 'http://localhost:5000/api/auth?action=login',
    headers: {
      get: (name) => name.toLowerCase() === 'content-type' ? 'application/json' : null,
      has: () => false,
      [Symbol.iterator]: function* () {}
    },
    json: async () => ({ username: 'testuser', password: 'testpass' }),
    text: async () => JSON.stringify({ username: 'testuser', password: 'testpass' }),
    formData: async () => null
  };

  try {
    const loginResponse = await authHandler(loginReq);
    const loginBody = await loginResponse.text();
    console.log(`Status: ${loginResponse.status}`);
    console.log(`Response: ${loginBody}\n`);
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test 2: Register request
  console.log('Test 2: Register request');
  const registerReq = {
    method: 'POST',
    url: 'http://localhost:5000/api/auth?action=register',
    headers: {
      get: (name) => name.toLowerCase() === 'content-type' ? 'application/json' : null,
      has: () => false,
      [Symbol.iterator]: function* () {}
    },
    json: async () => ({ username: 'newuser', email: 'new@example.com', password: 'password123' }),
    text: async () => JSON.stringify({ username: 'newuser', email: 'new@example.com', password: 'password123' }),
    formData: async () => null
  };

  try {
    const registerResponse = await authHandler(registerReq);
    const registerBody = await registerResponse.text();
    console.log(`Status: ${registerResponse.status}`);
    console.log(`Response: ${registerBody}\n`);
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Check environment variables
  console.log('\n📋 Environment Check:');
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
}

testAuth().catch(console.error);

