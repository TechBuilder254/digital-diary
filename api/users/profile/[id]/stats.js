const { fastQuery } = require('../../../../lib/supabase-rest');
const { handleCORS, createResponse } = require('../../../../lib/handler');

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
    // Parallel queries for fast stats - fetch minimal data and count
    const [notesResult, todosResult, completedTodosResult, favoriteNotesResult] = await Promise.all([
      fastQuery('notes', { select: 'id', limit: 1000, timeout: 2000 }).catch(() => []),
      fastQuery('todos', { 
        filters: { 'is_deleted': false }, 
        select: 'id', 
        limit: 1000, 
        timeout: 2000 
      }).catch(() => []),
      fastQuery('todos', { 
        filters: { 'completed': true, 'is_deleted': false }, 
        select: 'id', 
        limit: 1000, 
        timeout: 2000 
      }).catch(() => []),
      fastQuery('notes', { 
        filters: { 'is_favorite': true }, 
        select: 'id', 
        limit: 1000, 
        timeout: 2000 
      }).catch(() => [])
    ]);

    const stats = {
      totalNotes: Array.isArray(notesResult) ? notesResult.length : 0,
      totalTodos: Array.isArray(todosResult) ? todosResult.length : 0,
      completedTodos: Array.isArray(completedTodosResult) ? completedTodosResult.length : 0,
      favoriteNotes: Array.isArray(favoriteNotesResult) ? favoriteNotesResult.length : 0
    };

    return createResponse(stats, 200);
  } catch (err) {
    console.error('[Stats] Query error:', err.message);
    return createResponse({ 
      error: 'Database error', 
      details: err.message,
      stats: { totalNotes: 0, totalTodos: 0, completedTodos: 0, favoriteNotes: 0 }
    }, 500);
  }
};
