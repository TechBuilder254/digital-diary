const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { handleCORS, createResponse, parseBody } = require('../../lib/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return createResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    const body = await parseBody(req);
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
  } catch (error) {
    console.error('Registration error:', error);
    return createResponse({ message: 'An error occurred during registration', error: error.message }, 500);
  }
};

