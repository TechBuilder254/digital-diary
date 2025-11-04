const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { handleCORS, createResponse, parseBody } = require('../helpers/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return createResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    const body = await parseBody(req);
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
  } catch (error) {
    console.error('Login error:', error);
    return createResponse({ message: 'Database error', error: error.message }, 500);
  }
};

