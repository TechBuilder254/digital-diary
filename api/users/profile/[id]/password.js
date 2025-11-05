const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { handleCORS, createResponse, parseBody } = require('../../../../lib/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'PUT') {
    return createResponse({ message: 'Method not allowed' }, 405);
  }

  const url = new URL(req.url);
  const pathname = url.pathname;
  const parts = pathname.split('/').filter(p => p);
  const id = parts[parts.length - 2]; // ID is before 'password'

  try {
    const body = await parseBody(req);
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return createResponse({ error: 'Current password and new password are required' }, 400);
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      return createResponse({ error: 'User not found' }, 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return createResponse({ error: 'Current password is incorrect' }, 401);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ password: hashedNewPassword })
      .eq('id', id)
      .select('id')
      .single();

    if (updateError || !updatedUser) {
      return createResponse({
        error: updateError ? 'Password update failed' : 'User not found',
        details: updateError?.message || 'User not found'
      }, updateError ? 500 : 404);
    }

    return createResponse({ message: 'Password updated successfully' }, 200);
  } catch (error) {
    return createResponse({ error: 'An error occurred during password update', details: error.message }, 500);
  }
};

