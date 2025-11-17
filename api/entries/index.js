const { fastQuery, fastInsert, fastUpdate, fastDelete } = require('../../lib/supabase-rest');
const { handleCORS, createResponse, parseBody, getUserId } = require('../../lib/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const pathname = url.pathname;
  const pathParts = pathname.split('/').filter(p => p);
  const lastPart = pathParts[pathParts.length - 1];
  const id = lastPart && !isNaN(lastPart) && lastPart !== 'entries' ? lastPart : null;

  // Get user_id from request
  const userId = getUserId(req);

  // GET /api/entries - Fast query (filtered by user_id)
  if (req.method === 'GET' && !id && pathname === '/api/entries') {
    try {
      if (!userId || userId === null || userId === undefined) {
        return createResponse({ error: 'User ID is required. Please log in.' }, 401);
      }
      
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId) || numericUserId <= 0) {
        return createResponse({ error: 'Invalid user ID' }, 401);
      }
      
      let entries;
      try {
        entries = await fastQuery('entries', {
          filters: { 'user_id': numericUserId },
          orderBy: 'created_at',
          ascending: false,
          timeout: 2000
        });
      } catch (queryError) {
        return createResponse([], 200);
      }
      
      const filteredEntries = Array.isArray(entries) 
        ? entries.filter(e => {
            if (!e || !e.user_id) return false;
            const entryUserId = parseInt(e.user_id, 10);
            return !isNaN(entryUserId) && entryUserId === numericUserId;
          })
        : [];
      
      return createResponse(filteredEntries, 200);
    } catch (err) {
      return createResponse([], 200);
    }
  }

  // POST /api/entries
  if (req.method === 'POST' && pathname === '/api/entries') {
    try {
      const body = await parseBody(req);
      const { title, content, user_id } = body;

      const finalUserId = user_id || userId;
      
      if (!title || !content) {
        return createResponse({ error: 'Title and content are required' }, 400);
      }
      
      if (!finalUserId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }

      const newEntry = await fastInsert('entries', { title, content, user_id: finalUserId }, 3000);
      return createResponse(newEntry, 201);
    } catch (err) {
      return createResponse({ error: 'Error creating entry', details: err.message }, 500);
    }
  }

  // PUT /api/entries/:id
  if (req.method === 'PUT' && id && pathname.startsWith('/api/entries/')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const numericId = parseInt(id, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericId)) {
        return createResponse({ error: 'Invalid entry ID' }, 400);
      }
      
      // Verify ownership
      const existingEntry = await fastQuery('entries', {
        filters: { 'id': numericId, 'user_id': numericUserId },
        timeout: 2000
      });
      
      if (!existingEntry || existingEntry.length === 0) {
        return createResponse({ error: 'Entry not found or access denied' }, 404);
      }

      const body = await parseBody(req);
      const { title, content } = body;

      if (!title || !content) {
        return createResponse({ error: 'Title and content are required' }, 400);
      }

      const updatedEntry = await fastUpdate('entries', numericId, { title, content }, 3000);
      return createResponse(updatedEntry || { error: 'Entry not found' }, updatedEntry ? 200 : 404);
    } catch (err) {
      return createResponse({ error: 'Error updating entry', details: err.message }, 500);
    }
  }

  // DELETE /api/entries/:id
  if (req.method === 'DELETE' && id && pathname.startsWith('/api/entries/')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const numericId = parseInt(id, 10);
      const numericUserId = parseInt(userId, 10);
      
      if (isNaN(numericId)) {
        return createResponse({ error: 'Invalid entry ID' }, 400);
      }
      
      // Verify ownership
      const existingEntry = await fastQuery('entries', {
        filters: { 'id': numericId, 'user_id': numericUserId },
        timeout: 2000
      });
      
      if (!existingEntry || existingEntry.length === 0) {
        return createResponse({ error: 'Entry not found or access denied' }, 404);
      }
      
      await fastDelete('entries', numericId, 3000);
      return createResponse({ message: 'Entry deleted successfully' }, 200);
    } catch (err) {
      return createResponse({ error: 'Error deleting entry', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};
