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
  } catch (error) {
    console.error('Forgot password error:', error);
    return createResponse({ message: 'An error occurred during password reset', error: error.message }, 500);
  }
};

