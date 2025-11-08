#!/usr/bin/env node

/**
 * Smoke test for the deployed Digital Diary experience.
 * Hits the production URL and verifies core routes respond successfully.
 */

const assert = require('assert');

const BASE_URL = process.env.DIGITAL_DIARY_DEPLOY_URL?.trim() || 'https://digital-diary-azure.vercel.app';

const routes = [
  {
    name: 'Landing page',
    path: '/',
    method: 'GET',
    expectStatus: 200,
    expectText: 'Digital Diary - Your Personal Life Companion',
  },
  {
    name: 'Manifest',
    path: '/manifest.json',
    method: 'GET',
    expectStatus: 200,
  },
  {
    name: 'Robots',
    path: '/robots.txt',
    method: 'GET',
    expectStatus: 200,
  },
];

const color = {
  green: (text) => `\u001b[32m${text}\u001b[0m`,
  red: (text) => `\u001b[31m${text}\u001b[0m`,
  cyan: (text) => `\u001b[36m${text}\u001b[0m`,
};

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  const bodyText = await response.text();
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    try {
      return { response, body: JSON.parse(bodyText) };
    } catch {
      return { response, body: bodyText };
    }
  }

  return { response, body: bodyText };
};

const run = async () => {
  console.log(color.cyan(`🌐 Running deployment smoke test against ${BASE_URL}`));

  for (const route of routes) {
    const url = new URL(route.path, BASE_URL).toString();
    const method = route.method ?? 'GET';

    console.log(`→ ${method} ${url}`);

    const { response, body } = await fetchJson(url, { method });

    console.log(`  status: ${response.status}`);
    assert.strictEqual(
      response.status,
      route.expectStatus,
      `${route.name} expected status ${route.expectStatus}, received ${response.status}`,
    );

    if (typeof route.expectText === 'string') {
      assert(
        typeof body === 'string' && body.includes(route.expectText),
        `${route.name} did not include expected text "${route.expectText}"`,
      );
      console.log(`  ✓ contains text "${route.expectText}"`);
    }

    console.log(color.green(`  ✓ ${route.name} passed`));
  }

  console.log(color.green('✅ Deployment smoke test completed successfully'));
};

run().catch((error) => {
  console.error(color.red('❌ Deployment smoke test failed'));
  console.error(error);
  process.exitCode = 1;
});

