const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { handleCORS, createResponse, parseBody, getPathParams } = require('../../lib/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const pathname = url.pathname;
  const pathParts = pathname.split('/').filter(p => p);
  const lastPart = pathParts[pathParts.length - 1];
  const id = lastPart && !isNaN(lastPart) && lastPart !== 'entries' ? lastPart : null;

  // GET /api/entries
  if (req.method === 'GET' && !id && pathname === '/api/entries') {
    try {
      const { data: entries, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return createResponse({ error: 'Database query error', details: error.message }, 500);
      }

      return createResponse(entries || [], 200);
    } catch (err) {
      return createResponse({ error: 'Error fetching entries', details: err.message }, 500);
    }
  }

  // POST /api/entries
  if (req.method === 'POST' && pathname === '/api/entries') {
    try {
      const body = await parseBody(req);
      const { title, content, user_id } = body;

      if (!title || !content || !user_id) {
        return createResponse({ error: 'Title, content, and user_id are required' }, 400);
      }

      const { data: newEntry, error } = await supabase
        .from('entries')
        .insert([{ title, content, user_id }])
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database insert error', details: error.message }, 500);
      }

      return createResponse(newEntry, 201);
    } catch (err) {
      return createResponse({ error: 'Error creating entry', details: err.message }, 500);
    }
  }

  // PUT /api/entries/:id
  if (req.method === 'PUT' && id && pathname.startsWith('/api/entries/')) {
    try {
      const body = await parseBody(req);
      const { title, content } = body;

      if (!title || !content) {
        return createResponse({ error: 'Title and content are required' }, 400);
      }

      const { data: updatedEntry, error } = await supabase
        .from('entries')
        .update({ title, content })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database update error', details: error.message }, 500);
      }

      if (!updatedEntry) {
        return createResponse({ error: 'Entry not found' }, 404);
      }

      return createResponse(updatedEntry, 200);
    } catch (err) {
      return createResponse({ error: 'Error updating entry', details: err.message }, 500);
    }
  }

  // DELETE /api/entries/:id
  if (req.method === 'DELETE' && id && pathname.startsWith('/api/entries/')) {
    try {
      const { data: deletedEntry, error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database delete error', details: error.message }, 500);
      }

      if (!deletedEntry) {
        return createResponse({ error: 'Entry not found' }, 404);
      }

      return createResponse({ message: 'Entry deleted successfully' }, 200);
    } catch (err) {
      return createResponse({ error: 'Error deleting entry', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};

