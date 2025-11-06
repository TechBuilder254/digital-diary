const { fastQuery, fastInsert, fastDelete } = require('../../lib/supabase-rest');
const { handleCORS, createResponse, parseBody, getUserId } = require('../../lib/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const pathname = url.pathname;
  const pathParts = pathname.split('/').filter(p => p);
  const lastPart = pathParts[pathParts.length - 1];
  const id = lastPart && !isNaN(lastPart) && lastPart !== 'moods' ? lastPart : null;

  // Get user_id from request
  const userId = getUserId(req);

  // GET /api/moods - Fast query (filtered by user_id)
  if (req.method === 'GET' && !id && pathname === '/api/moods') {
    try {
      if (!userId || userId === null || userId === undefined) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        return createResponse({ error: 'Invalid user ID' }, 401);
      }
      
      const moods = await fastQuery('moods', {
        filters: { 'user_id': numericUserId },
        orderBy: 'date',
        ascending: false,
        timeout: 2000
      });
      
      // CRITICAL SAFETY CHECK
      const filteredMoods = Array.isArray(moods) 
        ? moods.filter(m => {
            const moodUserId = parseInt(m.user_id, 10);
            return !isNaN(moodUserId) && moodUserId === numericUserId;
          })
        : [];
      
      return createResponse(filteredMoods, 200);
    } catch (err) {
      console.error('[Moods] Query error:', err.message);
      return createResponse({ error: 'Database query failed' }, 500);
    }
  }

  // POST /api/moods
  if (req.method === 'POST' && pathname === '/api/moods') {
    try {
      const body = await parseBody(req);
      const { mood, date, user_id } = body;

      // Use user_id from body or from request (headers/query)
      const finalUserId = user_id || userId;

      if (!mood || !date) {
        return createResponse({ error: 'Mood and date are required' }, 400);
      }
      
      if (!finalUserId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }

      const newMood = await fastInsert('moods', {
        mood,
        date,
        user_id: finalUserId
      }, 3000);

      return createResponse(newMood, 201);
    } catch (err) {
      console.error('[Moods] Insert error:', err.message);
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // DELETE /api/moods/:id
  if (req.method === 'DELETE' && id && pathname.startsWith('/api/moods/')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      // Verify ownership
      const existingMood = await fastQuery('moods', {
        filters: { 'id': id, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingMood || existingMood.length === 0) {
        return createResponse({ error: 'Mood not found or access denied' }, 404);
      }
      
      await fastDelete('moods', id, 3000);
      return createResponse({ message: 'Mood deleted successfully' }, 200);
    } catch (err) {
      console.error('[Moods] Delete error:', err.message);
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};
