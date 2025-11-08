const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  });
}

// Create Supabase client with optimized configuration for performance
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'digital-diary-api',
      'Connection': 'keep-alive'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
}) : null;

const { handleCORS, createResponse, parseBody, getQueryParams } = require('../../lib/handler');

function log(...args) {
  console.log('[Auth]', ...args);
}

module.exports = async (req) => {
  const startTime = Date.now();
  log('request', { method: req.method, url: req.url });
  
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  // Check if Supabase is configured
  if (!supabase) {
    log('missing env', {
      hasUrl: Boolean(supabaseUrl),
      urlLength: supabaseUrl ? supabaseUrl.length : 0,
      hasKey: Boolean(supabaseKey),
      keyLength: supabaseKey ? supabaseKey.length : 0,
    });
    return createResponse({ 
      message: 'Server configuration error', 
      error: 'Database connection not configured' 
    }, 500);
  }

  if (req.method !== 'POST') {
    return createResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    const parseStart = Date.now();
    const body = await parseBody(req);
    const queryParams = getQueryParams(req);
    const action = queryParams.action || body.action || 'login';
    log('parsed', { durationMs: Date.now() - parseStart, action });

    // Route based on action
    const handlerStart = Date.now();
    let response;
    log('action:body', { action, body });

    switch (action) {
      case 'login':
        response = await handleLogin(body);
        break;
      case 'register':
        response = await handleRegister(body);
        break;
      case 'forgot-password':
        response = await handleForgotPassword(body);
        break;
      default:
        response = createResponse({ message: 'Invalid action' }, 400);
    }
    const result = await response;
    log('completed', {
      handlerMs: Date.now() - handlerStart,
      totalMs: Date.now() - startTime,
      status: result?.status,
    });
    return result;
  } catch (error) {
    log('error', { durationMs: Date.now() - startTime, message: error?.message, stack: error?.stack });
    return createResponse({ message: 'An error occurred', error: error.message }, 500);
  }
};

async function handleLogin(body) {
  const { username, password } = body;
  log('login:body', { hasUsername: Boolean(username), hasPassword: Boolean(password) });

  if (!username || !password) {
    log('login:missing-credentials');
    return createResponse({ message: 'Both username and password are required' }, 400);
  }

  // Trim username but keep case-sensitive (database stores case-sensitive usernames)
  const trimmedUsername = username.trim();

  try {
    const configSummary = {
      hasUrl: Boolean(supabaseUrl),
      keyLength: supabaseKey ? supabaseKey.length : 0,
    };
    log('login:config', configSummary);

    const healthStatus = await checkSupabaseHealth();
    log('login:health', healthStatus);
    if (!healthStatus.ok) {
      return createResponse({ message: 'Supabase health check failed', error: healthStatus.error }, 503);
    }

    log('login:start', { user: trimmedUsername });
    const queryStart = Date.now();
    
    // Use direct REST API call instead of JS client for better performance in serverless
    // This bypasses the JS client overhead and is faster for simple queries
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const restUrl = `${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(trimmedUsername)}&select=id,username,email,password&limit=1`;
    
    // Create AbortController for timeout (3 seconds for REST API, faster than JS client)
    const controller = new AbortController();
    const REST_TIMEOUT_MS = parseInt(process.env.SUPABASE_REST_TIMEOUT_MS || '8000', 10);
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error(`[Login] REST API request aborted after ${REST_TIMEOUT_MS}ms`);
    }, REST_TIMEOUT_MS);
    
    const fetchPromise = fetch(restUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      signal: controller.signal
    }).then(async (response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return response.json();
    }).catch((error) => {
      clearTimeout(timeoutId);
      throw error;
    });

    let users;
    try {
      users = await fetchPromise;
      log('login:rest:success', { durationMs: Date.now() - queryStart, count: users?.length || 0 });
    } catch (fetchError) {
      const elapsed = Date.now() - queryStart;
      log('login:rest:error', { durationMs: elapsed, message: fetchError?.message });

      const fallbackResult = await queryWithSupabaseClient(trimmedUsername, queryStart);
      if (!fallbackResult.ok) {
        return fallbackResult.response;
      }
      users = fallbackResult.users;
    }

    if (!users || users.length === 0) {
      log('login:invalid-credentials');
      return createResponse({ message: 'Invalid credentials' }, 401);
    }

    const user = users[0];

    // Add timeout to bcrypt comparison
    const compareStart = Date.now();
    const comparePromise = bcrypt.compare(password, user.password);
    const compareTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Password comparison timeout')), 5000)
    );

    let isMatch;
    try {
      isMatch = await Promise.race([comparePromise, compareTimeout]);
      log('login:password:success', { durationMs: Date.now() - compareStart });
    } catch (compareError) {
      log('login:password:error', { durationMs: Date.now() - compareStart, message: compareError?.message });
      return createResponse({ message: 'Request timeout - password verification issue', error: compareError.message }, 504);
    }

    if (isMatch) {
      log('login:success', { userId: user.id });
      return createResponse({
        message: 'Login successful',
        success: true,
        token: 'jwt-token-' + user.id,
        user: { id: user.id, username: user.username, email: user.email }
      }, 200);
    } else {
      log('login:password-mismatch');
      return createResponse({ message: 'Invalid credentials' }, 401);
    }
  } catch (error) {
    log('login:error', { message: error?.message, stack: error?.stack });
    return createResponse({ message: 'Login failed', error: error.message }, 500);
  }
}

async function queryWithSupabaseClient(trimmedUsername, queryStart) {
  try {
    const CLIENT_TIMEOUT_MS = parseInt(process.env.SUPABASE_CLIENT_TIMEOUT_MS || '10000', 10);
    const queryPromise = supabase
      .from('users')
      .select('id, username, email, password')
      .eq('username', trimmedUsername)
      .maybeSingle();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), CLIENT_TIMEOUT_MS)
    );

    const queryResult = await Promise.race([queryPromise, timeoutPromise]);
    if (queryResult && queryResult.error) {
      throw new Error(queryResult.error.message);
    }

    const users = queryResult && queryResult.data ? [queryResult.data] : [];
    log('login:client:success', { durationMs: Date.now() - queryStart, found: users.length });
    return { ok: true, users };
  } catch (fallbackError) {
    log('login:client:error', { message: fallbackError?.message });
    return {
      ok: false,
      response: createResponse({
        message: 'Database connection failed',
        error: fallbackError.message || 'Unable to connect to database',
      }, fallbackError.message && fallbackError.message.includes('timeout') ? 504 : 503),
    };
  }
}

async function checkSupabaseHealth() {
  if (!supabaseUrl) {
    return { ok: false, error: 'Supabase URL missing' };
  }

  const healthUrl = `${supabaseUrl}/auth/v1/health`;
  const HEALTH_TIMEOUT_MS = parseInt(process.env.SUPABASE_HEALTH_TIMEOUT_MS || '2000', 10);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey || '',
        'Authorization': `Bearer ${supabaseKey || ''}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return { ok: response.ok, status: response.status };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { ok: false, error: `Health check timeout after ${HEALTH_TIMEOUT_MS}ms` };
    }
    return { ok: false, error: error.message };
  }
}

async function handleRegister(body) {
  const { username, email, password } = body;

  if (!username || !email || !password) {
    return createResponse({ message: 'All fields are required' }, 400);
  }

  try {
    // Check if user exists with timeout
    const checkPromise = supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .limit(1);

    const checkTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database check timeout')), 10000)
    );

    const { data: existingUsers, error: checkError } = await Promise.race([checkPromise, checkTimeout]);

    if (checkError) {
      log('register:check:error', { message: checkError?.message, code: checkError?.code });
      return createResponse({ message: 'Database error', error: checkError.message }, 500);
    }

    if (existingUsers && existingUsers.length > 0) {
      return createResponse({ message: 'Username or email already exists' }, 400);
    }

    // Hash password with reduced rounds for faster hashing (8 rounds is still secure)
    const hashPromise = bcrypt.hash(password, 8);
    const hashTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Password hashing timeout')), 5000)
    );
    const hashedPassword = await Promise.race([hashPromise, hashTimeout]);

    // Insert user with timeout
    const insertPromise = supabase
      .from('users')
      .insert([{ username, email, password: hashedPassword }])
      .select()
      .single();

    const insertTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('User insert timeout')), 10000)
    );

    const { data: newUser, error: insertError } = await Promise.race([insertPromise, insertTimeout]);

    if (insertError) {
      log('register:insert:error', { message: insertError?.message, code: insertError?.code });
      return createResponse({ message: 'Registration failed', error: insertError.message }, 500);
    }

    return createResponse({ message: 'Registration successful!', success: true }, 200);
  } catch (error) {
    log('register:error', { message: error?.message, stack: error?.stack });
    return createResponse({ message: 'Registration failed', error: error.message }, 500);
  }
}

async function handleForgotPassword(body) {
  const { email, newPassword } = body;

  if (!email || !newPassword) {
    return createResponse({ message: 'Email and new password are required' }, 400);
  }

  // Check if email exists
  const { data: user, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .limit(1)
    .single();

  if (checkError || !user) {
    return createResponse({ message: 'Email not found' }, 404);
  }

  // Hash new password with reduced rounds for faster hashing
  const hashedPassword = await bcrypt.hash(newPassword, 8);

  // Update password
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({ password: hashedPassword })
    .eq('email', email)
    .select()
    .single();

  if (updateError || !updatedUser) {
    return createResponse({ message: 'Password update failed', error: updateError?.message || 'Update failed' }, 500);
  }

  return createResponse({ message: 'Password updated successfully', success: true }, 200);
}

