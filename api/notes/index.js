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
  const parts = pathname.split('/').filter(p => p);
  const lastPart = parts[parts.length - 1];
  const secondLastPart = parts[parts.length - 2];
  const id = lastPart && !isNaN(lastPart) && lastPart !== 'notes' && lastPart !== 'favorites' && lastPart !== 'category' ? lastPart : null;
  const action = lastPart === 'favorites' ? 'favorites' : (secondLastPart === 'category' ? 'category' : (secondLastPart === 'favorite' ? 'favorite' : null));

  // GET /api/notes
  if (req.method === 'GET' && !id && pathname === '/api/notes') {
    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return createResponse({ error: 'Database query error', details: error.message }, 500);
      }

      return createResponse(notes || [], 200);
    } catch (err) {
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // GET /api/notes/favorites
  if (req.method === 'GET' && pathname === '/api/notes/favorites') {
    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('is_favorite', true)
        .order('updated_at', { ascending: false });

      if (error) {
        return createResponse({ error: 'Database query error', details: error.message }, 500);
      }

      return createResponse(notes || [], 200);
    } catch (err) {
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // GET /api/notes/category/:category
  if (req.method === 'GET' && pathname.startsWith('/api/notes/category/') && lastPart && lastPart !== 'category') {
    const category = lastPart;
    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        return createResponse({ error: 'Database query error', details: error.message }, 500);
      }

      return createResponse(notes || [], 200);
    } catch (err) {
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // POST /api/notes
  if (req.method === 'POST' && pathname === '/api/notes') {
    try {
      const body = await parseBody(req);
      const { title, content, category, tags, priority, is_favorite, audio_filename, audio_duration, audio_size, has_audio, user_id } = body;

      if (!title || !content) {
        return createResponse({ error: 'Title and content are required' }, 400);
      }

      const { data: newNote, error } = await supabase
        .from('notes')
        .insert([{
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
          user_id: user_id || 1
        }])
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database insert error', details: error.message }, 500);
      }

      return createResponse(newNote, 201);
    } catch (err) {
      return createResponse({ error: 'Database insert error', details: err.message }, 500);
    }
  }

  // PUT /api/notes/:id
  if (req.method === 'PUT' && id && pathname.startsWith('/api/notes/') && !pathname.includes('/favorite')) {
    try {
      const body = await parseBody(req);
      const { title, content, category, tags, priority, is_favorite, audio_filename, audio_duration, audio_size, has_audio } = body;

      if (!title || !content) {
        return createResponse({ error: 'Title and content are required' }, 400);
      }

      const { data: updatedNote, error } = await supabase
        .from('notes')
        .update({
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
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database update error', details: error.message }, 500);
      }

      if (!updatedNote) {
        return createResponse({ error: 'Note not found' }, 404);
      }

      return createResponse(updatedNote, 200);
    } catch (err) {
      return createResponse({ error: 'Database update error', details: err.message }, 500);
    }
  }

  // PATCH /api/notes/:id/favorite
  if (req.method === 'PATCH' && pathname.includes('/favorite') && id) {
    try {
      const body = await parseBody(req);
      const { is_favorite } = body;

      const { data: updatedNote, error } = await supabase
        .from('notes')
        .update({ is_favorite: is_favorite ? true : false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database update error', details: error.message }, 500);
      }

      if (!updatedNote) {
        return createResponse({ error: 'Note not found' }, 404);
      }

      return createResponse({ message: 'Favorite status updated successfully', is_favorite: updatedNote.is_favorite }, 200);
    } catch (err) {
      return createResponse({ error: 'Database update error', details: err.message }, 500);
    }
  }

  // DELETE /api/notes/:id
  if (req.method === 'DELETE' && id && pathname.startsWith('/api/notes/') && !pathname.includes('/favorite') && !pathname.includes('/category')) {
    try {
      const { data: deletedNote, error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database delete error', details: error.message }, 500);
      }

      if (!deletedNote) {
        return createResponse({ error: 'Note not found' }, 404);
      }

      return createResponse({ message: 'Note deleted successfully' }, 200);
    } catch (err) {
      return createResponse({ error: 'Database delete error', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};

