const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { handleCORS, createResponse } = require('../../../helpers/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'GET') {
    return createResponse({ message: 'Method not allowed' }, 405);
  }

  const url = new URL(req.url);
  const pathname = url.pathname;
  const parts = pathname.split('/').filter(p => p);
  const id = parts[parts.length - 2]; // ID is before 'stats'

  try {
    const [notesResult, todosResult, completedTodosResult, favoriteNotesResult] = await Promise.all([
      supabase.from('notes').select('*', { count: 'exact', head: true }),
      supabase.from('todos').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('todos').select('*', { count: 'exact', head: true }).eq('completed', true).eq('is_deleted', false),
      supabase.from('notes').select('*', { count: 'exact', head: true }).eq('is_favorite', true)
    ]);

    const stats = {
      totalNotes: notesResult.count || 0,
      totalTodos: todosResult.count || 0,
      completedTodos: completedTodosResult.count || 0,
      favoriteNotes: favoriteNotesResult.count || 0
    };

    return createResponse(stats, 200);
  } catch (err) {
    return createResponse({ error: 'Database error', details: err.message }, 500);
  }
};

