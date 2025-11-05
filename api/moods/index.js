const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { handleCORS, createResponse, parseBody } = require('../../lib/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const pathname = url.pathname;
  const pathParts = pathname.split('/').filter(p => p);
  const lastPart = pathParts[pathParts.length - 1];
  const id = lastPart && !isNaN(lastPart) && lastPart !== 'moods' ? lastPart : null;

  // GET /api/moods
  if (req.method === 'GET' && !id && pathname === '/api/moods') {
    try {
      const { data: moods, error } = await supabase
        .from('moods')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        return createResponse({ error: 'Database query error', details: error.message }, 500);
      }

      return createResponse(moods || [], 200);
    } catch (err) {
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // POST /api/moods
  if (req.method === 'POST' && pathname === '/api/moods') {
    try {
      const body = await parseBody(req);
      const { mood, date, user_id } = body;

      if (!mood || !date) {
        return createResponse({ error: 'Mood and date are required' }, 400);
      }

      const { data: newMood, error } = await supabase
        .from('moods')
        .insert([{
          mood,
          date,
          user_id: user_id || 1
        }])
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database insert error', details: error.message }, 500);
      }

      return createResponse({ id: newMood.id, mood: newMood.mood, date: newMood.date }, 201);
    } catch (err) {
      return createResponse({ error: 'Database insert error', details: err.message }, 500);
    }
  }

  // DELETE /api/moods/:id
  if (req.method === 'DELETE' && id && pathname.startsWith('/api/moods/')) {
    try {
      if (isNaN(id)) {
        return createResponse({ error: 'Valid mood ID is required' }, 400);
      }

      const { data: deletedMood, error } = await supabase
        .from('moods')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database delete error', details: error.message }, 500);
      }

      if (!deletedMood) {
        return createResponse({ error: 'Mood entry not found' }, 404);
      }

      return createResponse({ message: 'Mood entry deleted successfully' }, 200);
    } catch (err) {
      return createResponse({ error: 'Database delete error', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};

