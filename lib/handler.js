// Helper function to create Vercel serverless function handlers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
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
  const params = {};
  
  // Handle both absolute and relative URLs
  // Vercel serverless functions provide req.url as a relative path like "/api/auth?action=login"
  let url;
  try {
    // Try to create URL - if it fails, it's likely a relative path
    url = new URL(req.url);
  } catch (error) {
    // If it's a relative path, use a base URL to parse it properly
    // Using the actual domain from headers if available, otherwise a dummy base
    const baseUrl = req.headers?.get?.('host') 
      ? `https://${req.headers.get('host')}` 
      : 'https://vercel.app';
    url = new URL(req.url, baseUrl);
  }
  
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// Extract path parameters from route pattern
function getPathParams(req, pattern) {
  let url;
  try {
    url = new URL(req.url);
  } catch (error) {
    // If it's a relative path, use a dummy base URL
    url = new URL(req.url, 'https://vercel.app');
  }
  
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

// Extract user_id from request (synchronous - from headers or query params)
// For POST/PUT, extract user_id from body separately
function getUserId(req) {
  try {
    // Try Authorization header first (format: "Bearer jwt-token-{id}" or "jwt-token-{id}")
    let authHeader = null;
    if (req.headers?.get) {
      authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    } else if (req.headers) {
      authHeader = req.headers['authorization'] || req.headers['Authorization'];
    }
    
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      
      if (token.startsWith('jwt-token-')) {
        const userId = token.replace('jwt-token-', '');
        const parsedId = parseInt(userId, 10);
        if (!isNaN(parsedId)) {
          return parsedId;
        }
      }
    }

    // Try query params
    const queryParams = getQueryParams(req);
    if (queryParams.user_id) {
      const parsedId = parseInt(queryParams.user_id, 10);
      if (!isNaN(parsedId)) {
        return parsedId;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  handleCORS,
  createResponse,
  parseBody,
  getQueryParams,
  getPathParams,
  getUserId,
  corsHeaders,
};

