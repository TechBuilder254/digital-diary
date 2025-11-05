const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { handleCORS, createResponse, parseBody, getQueryParams } = require('../../lib/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return createResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    const body = await parseBody(req);
    const queryParams = getQueryParams(req);
    const action = queryParams.action || body.action || 'login'; // Default to login

    // Route based on action
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
    console.error('Auth error:', error);
    return createResponse({ message: 'An error occurred', error: error.message }, 500);
  }
};

async function handleLogin(body) {
  const { username, password } = body;

  if (!username || !password) {
    return createResponse({ message: 'Both username and password are required' }, 400);
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .limit(1)
    .single();

  if (error || !user) {
    return createResponse({ message: 'Invalid credentials' }, 401);
  }

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
}

async function handleRegister(body) {
  const { username, email, password } = body;

  if (!username || !email || !password) {
    return createResponse({ message: 'All fields are required' }, 400);
  }

  // Check if user exists
  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('id')
    .or(`username.eq.${username},email.eq.${email}`)
    .limit(1);

  if (checkError) {
    console.error('Database check error:', checkError);
    return createResponse({ message: 'Database error', error: checkError.message }, 500);
  }

  if (existingUsers && existingUsers.length > 0) {
    return createResponse({ message: 'Username or email already exists' }, 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{ username, email, password: hashedPassword }])
    .select()
    .single();

  if (insertError) {
    console.error('Insert error:', insertError);
    return createResponse({ message: 'Registration failed', error: insertError.message }, 500);
  }

  return createResponse({ message: 'Registration successful!', success: true }, 200);
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

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

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

