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

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  if (!supabase) {
    return createResponse({ 
      message: 'Server configuration error', 
      error: 'Database connection not configured' 
    }, 500);
  }

  if (req.method !== 'POST') {
    return createResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    const body = await parseBody(req);
    const queryParams = getQueryParams(req);
    const action = queryParams.action || body.action || 'login';

    switch (action) {
      case 'login':
        return await handleLogin(body);
      case 'register':
        return await handleRegister(body);
      case 'forgot-password':
        return await handleForgotPassword(body);
      default:
        return createResponse({ message: 'Invalid action' }, 400);
    }
  } catch (error) {
    return createResponse({ message: 'An error occurred', error: error.message }, 500);
  }
};

async function handleLogin(body) {
  const { username, password } = body;

  if (!username || !password) {
    return createResponse({ message: 'Both username and password are required' }, 400);
  }

  const trimmedUsername = username.trim();

  try {
    // Use optimized fastQuery for maximum speed
    const { fastQuery } = require('../../lib/supabase-rest');
    
    const users = await fastQuery('users', {
      filters: { 'username': trimmedUsername },
      select: 'id,username,email,password',
      limit: 1,
      timeout: 1500
    });

    if (!users || users.length === 0) {
      return createResponse({ message: 'Invalid credentials' }, 401);
    }

    const user = users[0];

    // Direct bcrypt comparison - no timeout wrapper needed (bcrypt is fast)
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return createResponse({
        message: 'Login successful',
        success: true,
        token: 'jwt-token-' + user.id,
        user: { id: user.id, username: user.username, email: user.email }
      }, 200);
    } else {
      return createResponse({ message: 'Invalid credentials' }, 401);
    }
  } catch (error) {
    return createResponse({ message: 'Login failed', error: error.message }, 500);
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
      return createResponse({ message: 'Registration failed', error: insertError.message }, 500);
    }

    return createResponse({ message: 'Registration successful!', success: true }, 200);
  } catch (error) {
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

