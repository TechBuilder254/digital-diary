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
    // Debug: Check what we're receiving
    console.log('[getUserId] Starting extraction...');
    console.log('[getUserId] req.headers type:', typeof req.headers);
    console.log('[getUserId] req.headers.get type:', typeof req.headers?.get);
    
    // Try Authorization header first (format: "Bearer jwt-token-{id}" or "jwt-token-{id}")
    let authHeader = null;
    if (req.headers?.get) {
      authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    } else if (req.headers) {
      // Fallback: direct access
      authHeader = req.headers['authorization'] || req.headers['Authorization'];
    }
    
    if (authHeader) {
      console.log('[getUserId] Found Authorization header:', authHeader.substring(0, 30) + '...');
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      console.log('[getUserId] Extracted token:', token.substring(0, 20) + '...');
      
      if (token.startsWith('jwt-token-')) {
        const userId = token.replace('jwt-token-', '');
        const parsedId = parseInt(userId, 10);
        if (!isNaN(parsedId)) {
          console.log('[getUserId] ✅ Extracted user_id from token:', parsedId);
          return parsedId;
        } else {
          console.error('[getUserId] ❌ Failed to parse user_id from token:', userId);
        }
      } else {
        console.warn('[getUserId] Token does not start with "jwt-token-":', token.substring(0, 20));
      }
    } else {
      console.warn('[getUserId] No Authorization header found');
    }

    // Try query params
    const queryParams = getQueryParams(req);
    console.log('[getUserId] Query params:', queryParams);
    if (queryParams.user_id) {
      const parsedId = parseInt(queryParams.user_id, 10);
      if (!isNaN(parsedId)) {
        console.log('[getUserId] ✅ Extracted user_id from query params:', parsedId);
        return parsedId;
      }
    }

    console.error('[getUserId] ❌ No user_id found in headers or query params');
    return null;
  } catch (error) {
    console.error('[getUserId] ❌ Error extracting user_id:', error);
    console.error('[getUserId] Error stack:', error.stack);
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

