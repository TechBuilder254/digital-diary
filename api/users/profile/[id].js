const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { handleCORS, createResponse, parseBody } = require('../../helpers/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const pathname = url.pathname;
  const parts = pathname.split('/').filter(p => p);
  const id = parts[parts.length - 1]; // Last part is the ID
  const action = url.searchParams.get('action'); // For stats/password

  // GET /api/users/profile/:id
  if (req.method === 'GET' && !action) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, email, avatar, bio, join_date, last_updated')
        .eq('id', id)
        .single();

      if (error || !user) {
        return createResponse({ error: 'User not found' }, 404);
      }

      return createResponse(user, 200);
    } catch (err) {
      return createResponse({ error: 'Database error', details: err.message }, 500);
    }
  }

  // PUT /api/users/profile/:id
  if (req.method === 'PUT' && !action) {
    try {
      const body = await parseBody(req);
      const { username, email, avatar, bio } = body;

      // Check if username or email already exists
      if (username || email) {
        const { data: existingUsers, error: checkError } = await supabase
          .from('users')
          .select('id')
          .or(`username.eq.${username},email.eq.${email}`)
          .neq('id', id)
          .limit(1);

        if (checkError) {
          return createResponse({ error: 'Database error', details: checkError.message }, 500);
        }

        if (existingUsers && existingUsers.length > 0) {
          return createResponse({ error: 'Username or email already exists' }, 400);
        }
      }

      const updateData = {};
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (bio !== undefined) updateData.bio = bio;

      if (Object.keys(updateData).length === 0) {
        return createResponse({ error: 'No fields to update' }, 400);
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select('id, username, email, avatar, bio, join_date, last_updated')
        .single();

      if (updateError || !updatedUser) {
        return createResponse({
          error: updateError ? 'Database update error' : 'User not found',
          details: updateError?.message || 'User not found'
        }, updateError ? 500 : 404);
      }

      return createResponse(updatedUser, 200);
    } catch (err) {
      return createResponse({ error: 'Database error', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};

