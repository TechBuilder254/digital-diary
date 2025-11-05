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
  // Check if last part is a number (ID) or route name
  const id = lastPart && !isNaN(lastPart) && lastPart !== 'todo' && lastPart !== 'trash' ? lastPart : null;
  const action = lastPart === 'trash' ? 'trash' : (secondLastPart && !isNaN(secondLastPart) ? lastPart : null);

  // GET /api/todo
  if (req.method === 'GET' && !id && pathname === '/api/todo') {
    try {
      const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        return createResponse({ error: 'Database query error', details: error.message }, 500);
      }

      return createResponse(todos || [], 200);
    } catch (err) {
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // GET /api/todo/trash
  if (req.method === 'GET' && lastPart === 'trash' && pathname === '/api/todo/trash') {
    try {
      const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false });

      if (error) {
        return createResponse({ error: 'Database query error', details: error.message }, 500);
      }

      return createResponse(todos || [], 200);
    } catch (err) {
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // POST /api/todo
  if (req.method === 'POST' && pathname === '/api/todo') {
    try {
      const body = await parseBody(req);
      const { text, completed, expiry_date, user_id } = body;

      if (!text) {
        return createResponse({ error: 'Text is required' }, 400);
      }

      const { data: newTodo, error } = await supabase
        .from('todos')
        .insert([{
          text,
          completed: completed || false,
          expiry_date: expiry_date || null,
          user_id: user_id || 1
        }])
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database insert error', details: error.message }, 500);
      }

      return createResponse({ message: 'To-Do item created', todoId: newTodo.id, todo: newTodo }, 201);
    } catch (err) {
      return createResponse({ error: 'Database insert error', details: err.message }, 500);
    }
  }

  // PUT /api/todo/:id
  if (req.method === 'PUT' && id && pathname.startsWith('/api/todo/') && !pathname.includes('/restore')) {
    try {
      const body = await parseBody(req);
      const { text, completed, expiry_date, is_deleted, deleted_at } = body;

      if (text === undefined && completed === undefined && expiry_date === undefined && is_deleted === undefined) {
        return createResponse({ error: 'At least one field is required for update' }, 400);
      }

      const updateData = {};
      if (text !== undefined) updateData.text = text;
      if (completed !== undefined) updateData.completed = completed;
      if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
      if (is_deleted !== undefined) updateData.is_deleted = is_deleted;
      if (deleted_at !== undefined) updateData.deleted_at = deleted_at;

      const { data: updatedTodo, error } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database update error', details: error.message }, 500);
      }

      if (!updatedTodo) {
        return createResponse({ error: 'To-Do item not found' }, 404);
      }

      return createResponse({ message: 'To-Do item updated successfully', todo: updatedTodo }, 200);
    } catch (err) {
      return createResponse({ error: 'Database update error', details: err.message }, 500);
    }
  }

  // PUT /api/todo/:id/restore
  if (req.method === 'PUT' && pathname.includes('/restore') && id) {
    try {
      const { data: restoredTodo, error } = await supabase
        .from('todos')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database restore error', details: error.message }, 500);
      }

      if (!restoredTodo) {
        return createResponse({ error: 'To-Do item not found in trash' }, 404);
      }

      return createResponse({ message: 'To-Do item restored successfully' }, 200);
    } catch (err) {
      return createResponse({ error: 'Database restore error', details: err.message }, 500);
    }
  }

  // DELETE /api/todo/:id
  if (req.method === 'DELETE' && id && !pathname.includes('/permanent')) {
    try {
      const { data: deletedTodo, error } = await supabase
        .from('todos')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database delete error', details: error.message }, 500);
      }

      if (!deletedTodo) {
        return createResponse({ error: 'To-Do item not found' }, 404);
      }

      return createResponse({ message: 'To-Do item moved to trash successfully' }, 200);
    } catch (err) {
      return createResponse({ error: 'Database delete error', details: err.message }, 500);
    }
  }

  // DELETE /api/todo/:id/permanent
  if (req.method === 'DELETE' && pathname.includes('/permanent') && id) {
    try {
      const { data: todo, error: checkError } = await supabase
        .from('todos')
        .select('id, is_deleted')
        .eq('id', id)
        .eq('is_deleted', true)
        .single();

      if (checkError || !todo) {
        return createResponse({ error: 'To-Do item not found in trash' }, 404);
      }

      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return createResponse({ error: 'Database permanent delete error', details: deleteError.message }, 500);
      }

      return createResponse({ message: 'To-Do item permanently deleted' }, 200);
    } catch (err) {
      return createResponse({ error: 'Database permanent delete error', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};

