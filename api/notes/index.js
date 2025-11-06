const { fastQuery, fastInsert, fastUpdate, fastDelete } = require('../../lib/supabase-rest');
const { handleCORS, createResponse, parseBody, getUserId } = require('../../lib/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const pathname = url.pathname;
  const parts = pathname.split('/').filter(p => p);
  const lastPart = parts[parts.length - 1];
  const secondLastPart = parts[parts.length - 2];
  const id = lastPart && !isNaN(lastPart) && lastPart !== 'notes' && lastPart !== 'favorites' && lastPart !== 'category' ? lastPart : null;
  const action = lastPart === 'favorites' ? 'favorites' : (secondLastPart === 'category' ? 'category' : (secondLastPart === 'favorite' ? 'favorite' : null));

  // Get user_id from request
  const userId = getUserId(req);

  // GET /api/notes - Fast query (filtered by user_id)
  if (req.method === 'GET' && !id && pathname === '/api/notes') {
    try {
      if (!userId || userId === null || userId === undefined) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        return createResponse({ error: 'Invalid user ID' }, 401);
      }
      
      const notes = await fastQuery('notes', {
        filters: { 'user_id': numericUserId },
        orderBy: 'created_at',
        ascending: false,
        timeout: 2000
      });
      
      // CRITICAL SAFETY CHECK
      const filteredNotes = Array.isArray(notes) 
        ? notes.filter(n => {
            const noteUserId = parseInt(n.user_id, 10);
            return !isNaN(noteUserId) && noteUserId === numericUserId;
          })
        : [];
      
      return createResponse(filteredNotes, 200);
    } catch (err) {
      console.error('[Notes] Query error:', err.message);
      return createResponse({ error: 'Database query failed' }, 500);
    }
  }

  // GET /api/notes/favorites (filtered by user_id)
  if (req.method === 'GET' && pathname === '/api/notes/favorites') {
    try {
      if (!userId || userId === null || userId === undefined) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        return createResponse({ error: 'Invalid user ID' }, 401);
      }
      
      const notes = await fastQuery('notes', {
        filters: { 'is_favorite': true, 'user_id': numericUserId },
        orderBy: 'updated_at',
        ascending: false,
        timeout: 2000
      });
      
      // CRITICAL SAFETY CHECK
      const filteredNotes = Array.isArray(notes) 
        ? notes.filter(n => {
            const noteUserId = parseInt(n.user_id, 10);
            return !isNaN(noteUserId) && noteUserId === numericUserId;
          })
        : [];
      
      return createResponse(filteredNotes, 200);
    } catch (err) {
      console.error('[Notes] Favorites query error:', err.message);
      return createResponse({ error: 'Database query failed' }, 500);
    }
  }

  // GET /api/notes/category/:category (filtered by user_id)
  if (req.method === 'GET' && pathname.startsWith('/api/notes/category/') && lastPart && lastPart !== 'category') {
    const category = lastPart;
    try {
      if (!userId || userId === null || userId === undefined) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        return createResponse({ error: 'Invalid user ID' }, 401);
      }
      
      const notes = await fastQuery('notes', {
        filters: { 'category': category, 'user_id': numericUserId },
        orderBy: 'created_at',
        ascending: false,
        timeout: 2000
      });
      
      // CRITICAL SAFETY CHECK
      const filteredNotes = Array.isArray(notes) 
        ? notes.filter(n => {
            const noteUserId = parseInt(n.user_id, 10);
            return !isNaN(noteUserId) && noteUserId === numericUserId;
          })
        : [];
      
      return createResponse(filteredNotes, 200);
    } catch (err) {
      console.error('[Notes] Category query error:', err.message);
      return createResponse({ error: 'Database query failed' }, 500);
    }
  }

  // POST /api/notes
  if (req.method === 'POST' && pathname === '/api/notes') {
    try {
      const body = await parseBody(req);
      const { title, content, category, tags, priority, is_favorite, audio_filename, audio_duration, audio_size, has_audio, user_id } = body;

      // Use user_id from body or from request (headers/query)
      const finalUserId = user_id || userId;

      if (!title || !content) {
        return createResponse({ error: 'Title and content are required' }, 400);
      }
      
      if (!finalUserId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }

      const newNote = await fastInsert('notes', {
        title,
        content,
        category: category || null,
        tags: tags || null,
        priority: priority || 'Medium',
        is_favorite: is_favorite || false,
        audio_filename: audio_filename || null,
        audio_duration: audio_duration || null,
        audio_size: audio_size || null,
        has_audio: has_audio || false,
        user_id: finalUserId
      }, 3000);

      return createResponse(newNote, 201);
    } catch (err) {
      console.error('[Notes] Insert error:', err.message);
      return createResponse({ error: 'Database insert error', details: err.message }, 500);
    }
  }

  // PUT /api/notes/:id
  if (req.method === 'PUT' && id && pathname.startsWith('/api/notes/') && !pathname.includes('/favorite')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      // Verify ownership
      const existingNote = await fastQuery('notes', {
        filters: { 'id': id, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingNote || existingNote.length === 0) {
        return createResponse({ error: 'Note not found or access denied' }, 404);
      }

      const body = await parseBody(req);
      const { title, content, category, tags, priority, is_favorite, audio_filename, audio_duration, audio_size, has_audio } = body;

      if (!title || !content) {
        return createResponse({ error: 'Title and content are required' }, 400);
      }

      const updateData = {
        title,
        content,
        category: category || null,
        tags: tags || null,
        priority: priority || 'Medium',
        is_favorite: is_favorite !== undefined ? is_favorite : false,
        audio_filename: audio_filename || null,
        audio_duration: audio_duration || null,
        audio_size: audio_size || null,
        has_audio: has_audio !== undefined ? has_audio : false
      };

      const updatedNote = await fastUpdate('notes', id, updateData, 3000);
      return createResponse(updatedNote || { error: 'Note not found' }, updatedNote ? 200 : 404);
    } catch (err) {
      console.error('[Notes] Update error:', err.message);
      return createResponse({ error: 'Database update error', details: err.message }, 500);
    }
  }

  // PATCH /api/notes/:id/favorite
  if (req.method === 'PATCH' && pathname.includes('/favorite') && id) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      // Verify ownership
      const existingNote = await fastQuery('notes', {
        filters: { 'id': id, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingNote || existingNote.length === 0) {
        return createResponse({ error: 'Note not found or access denied' }, 404);
      }
      
      const body = await parseBody(req);
      const { is_favorite } = body;

      const updatedNote = await fastUpdate('notes', id, { is_favorite: is_favorite ? true : false }, 3000);
      return createResponse({ 
        message: 'Favorite status updated successfully', 
        is_favorite: updatedNote?.is_favorite 
      }, updatedNote ? 200 : 404);
    } catch (err) {
      console.error('[Notes] Favorite update error:', err.message);
      return createResponse({ error: 'Database update error', details: err.message }, 500);
    }
  }

  // DELETE /api/notes/:id
  if (req.method === 'DELETE' && id && pathname.startsWith('/api/notes/') && !pathname.includes('/favorite') && !pathname.includes('/category')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      // Verify ownership
      const existingNote = await fastQuery('notes', {
        filters: { 'id': id, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingNote || existingNote.length === 0) {
        return createResponse({ error: 'Note not found or access denied' }, 404);
      }
      
      await fastDelete('notes', id, 3000);
      return createResponse({ message: 'Note deleted successfully' }, 200);
    } catch (err) {
      console.error('[Notes] Delete error:', err.message);
      return createResponse({ error: 'Database delete error', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};
