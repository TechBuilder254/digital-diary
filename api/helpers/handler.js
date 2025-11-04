// Helper function to create Vercel serverless function handlers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
function handleCORS(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

// Create a response with CORS headers
function createResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// Parse request body
async function parseBody(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await req.json();
    }
    if (contentType.includes('multipart/form-data')) {
      return await req.formData();
    }
    return {};
  } catch (error) {
    return {};
  }
}

// Extract query parameters
function getQueryParams(req) {
  const url = new URL(req.url);
  const params = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// Extract path parameters from route pattern
function getPathParams(req, pattern) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  const params = {};

  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.substring(1);
      params[paramName] = pathParts[index];
    }
  });

  return params;
}

module.exports = {
  handleCORS,
  createResponse,
  parseBody,
  getQueryParams,
  getPathParams,
  corsHeaders,
};

