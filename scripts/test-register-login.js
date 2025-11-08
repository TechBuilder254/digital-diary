#!/usr/bin/env node

/**
 * Smoke test for registration + login flow.
 * This executes the auth handler directly to avoid needing a running server.
 */

const crypto = require('crypto');
const assert = require('assert');
require('dotenv').config();

const authHandler = require('../api/auth/index');

const createMockRequest = (action, body) => {
  const payload = JSON.stringify(body);

  return {
    method: 'POST',
    url: `http://localhost:5000/api/auth?action=${action}`,
    headers: {
      get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      has: () => false,
      [Symbol.iterator]: function* iterate() {},
    },
    json: async () => ({ ...body }),
    text: async () => payload,
    formData: async () => null,
  };
};

const readJson = async (response) => {
  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse JSON (status ${response.status}): ${raw}`);
  }
};

(async () => {
  const suffix = crypto.randomUUID().split('-')[0];
  const username = `auto_${suffix}`;
  const email = `${username}@example.com`;
  const password = `Aa${suffix}#123`; // Matches validation rules

  console.log('🧪 Running register + login smoke test');
  console.log('User:', { username, email });

  const registerRequest = createMockRequest('register', {
    username,
    email,
    password,
  });

  const registerResponse = await authHandler(registerRequest);
  const registerBody = await readJson(registerResponse);

  console.log('Register status:', registerResponse.status);
  console.log('Register response:', registerBody);

  assert.strictEqual(registerResponse.status, 200, 'Registration did not return HTTP 200');
  assert(registerBody.success, 'Registration success flag missing or false');

  const loginRequest = createMockRequest('login', {
    username,
    password,
  });

  const loginResponse = await authHandler(loginRequest);
  const loginBody = await readJson(loginResponse);

  console.log('Login status:', loginResponse.status);
  console.log('Login response:', loginBody);

  assert.strictEqual(loginResponse.status, 200, 'Login did not return HTTP 200');
  assert(loginBody.success, 'Login success flag missing or false');
  assert(loginBody.token, 'Login did not return token');

  console.log('✅ Register + login smoke test passed');
})().catch((error) => {
  console.error('❌ Register + login smoke test failed');
  console.error(error);
  process.exitCode = 1;
});
