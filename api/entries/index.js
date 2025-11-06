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
      // CRITICAL: Must have userId - return 401 if not found
      if (!userId || userId === null || userId === undefined) {
        console.error('[Entries GET] ❌ SECURITY: No user_id found - returning 401');
        return createResponse({ error: 'User ID is required. Please log in.' }, 401);
      }
      
      // Ensure userId is a number
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId) || numericUserId <= 0) {
        console.error('[Entries GET] ❌ SECURITY: Invalid user_id:', userId);
        return createResponse({ error: 'Invalid user ID' }, 401);
      }
      
      console.log('[Entries GET] ✅ Valid user_id:', numericUserId, '- Querying entries...');
      
      // Query with user_id filter - this is MANDATORY
      // If filter fails, we'll catch it with safety check below
      let entries;
      try {
        entries = await fastQuery('entries', {
          filters: { 'user_id': numericUserId },
          orderBy: 'created_at',
          ascending: false,
          timeout: 2000
        });
        console.log('[Entries GET] Database query returned', entries?.length || 0, 'entries');
      } catch (queryError) {
        console.error('[Entries GET] Database query error:', queryError.message);
        // If query fails, return empty array (don't expose other users' data)
        return createResponse([], 200);
      }
      
      // CRITICAL SAFETY CHECK: ALWAYS filter - this is non-negotiable
      // Filter out ANY entries that don't belong to this user
      const filteredEntries = Array.isArray(entries) 
        ? entries.filter(e => {
            if (!e || !e.user_id) return false;
            const entryUserId = parseInt(e.user_id, 10);
            const matches = !isNaN(entryUserId) && entryUserId === numericUserId;
            if (!matches) {
              console.error(`[Entries GET] ⚠️ SECURITY: Filtering out entry ${e.id} with user_id ${e.user_id} (expected ${numericUserId})`);
            }
            return matches;
          })
        : [];
      
      // Log security warning if filter found wrong data
      if (filteredEntries.length !== (entries?.length || 0)) {
        console.error(`[Entries GET] 🚨 SECURITY ALERT: Database returned ${entries?.length || 0} entries but only ${filteredEntries.length} belong to user ${numericUserId}!`);
        console.error(`[Entries GET] This indicates the database filter may not be working correctly.`);
      }
      
      console.log('[Entries GET] ✅ Returning', filteredEntries.length, 'entries for user', numericUserId);
      return createResponse(filteredEntries, 200);
    } catch (err) {
      console.error('[Entries] ❌ Unexpected error:', err.message);
      console.error('[Entries] Stack:', err.stack);
      // On any error, return empty array (never expose other users' data)
      return createResponse([], 200);
    }
  }

  // POST /api/entries
  if (req.method === 'POST' && pathname === '/api/entries') {
    try {
      const body = await parseBody(req);
      const { title, content, user_id } = body;

      // Use user_id from body or from request (headers/query)
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
      console.error('[Entries] Insert error:', err.message);
      return createResponse({ error: 'Error creating entry', details: err.message }, 500);
    }
  }

  // PUT /api/entries/:id
  if (req.method === 'PUT' && id && pathname.startsWith('/api/entries/')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      // Verify ownership
      const existingEntry = await fastQuery('entries', {
        filters: { 'id': id, 'user_id': userId },
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

      const updatedEntry = await fastUpdate('entries', id, { title, content }, 3000);
      return createResponse(updatedEntry || { error: 'Entry not found' }, updatedEntry ? 200 : 404);
    } catch (err) {
      console.error('[Entries] Update error:', err.message);
      return createResponse({ error: 'Error updating entry', details: err.message }, 500);
    }
  }

  // DELETE /api/entries/:id
  if (req.method === 'DELETE' && id && pathname.startsWith('/api/entries/')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      // Verify ownership
      const existingEntry = await fastQuery('entries', {
        filters: { 'id': id, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingEntry || existingEntry.length === 0) {
        return createResponse({ error: 'Entry not found or access denied' }, 404);
      }
      
      await fastDelete('entries', id, 3000);
      return createResponse({ message: 'Entry deleted successfully' }, 200);
    } catch (err) {
      console.error('[Entries] Delete error:', err.message);
      return createResponse({ error: 'Error deleting entry', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};
