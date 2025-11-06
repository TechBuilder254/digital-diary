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
  const id = lastPart && !isNaN(lastPart) && lastPart !== 'todo' && lastPart !== 'trash' ? lastPart : null;
  const action = lastPart === 'trash' ? 'trash' : (secondLastPart && !isNaN(secondLastPart) ? lastPart : null);

  // Get user_id from request
  const userId = getUserId(req);

  // GET /api/todo - Fast query (filtered by user_id)
  if (req.method === 'GET' && !id && pathname === '/api/todo') {
    try {
      if (!userId || userId === null || userId === undefined) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        return createResponse({ error: 'Invalid user ID' }, 401);
      }
      
      const todos = await fastQuery('todos', {
        filters: { 'is_deleted': false, 'user_id': numericUserId },
        orderBy: 'created_at',
        ascending: false,
        timeout: 2000
      });
      
      // CRITICAL SAFETY CHECK
      const filteredTodos = Array.isArray(todos) 
        ? todos.filter(t => {
            const todoUserId = parseInt(t.user_id, 10);
            return !isNaN(todoUserId) && todoUserId === numericUserId;
          })
        : [];
      
      return createResponse(filteredTodos, 200);
    } catch (err) {
      console.error('[Todos] Query error:', err.message);
      return createResponse({ error: 'Database query failed' }, 500);
    }
  }

  // GET /api/todo/trash (filtered by user_id)
  if (req.method === 'GET' && lastPart === 'trash' && pathname === '/api/todo/trash') {
    try {
      if (!userId || userId === null || userId === undefined) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        return createResponse({ error: 'Invalid user ID' }, 401);
      }
      
      const todos = await fastQuery('todos', {
        filters: { 'is_deleted': true, 'user_id': numericUserId },
        orderBy: 'deleted_at',
        ascending: false,
        timeout: 2000
      });
      
      // CRITICAL SAFETY CHECK
      const filteredTodos = Array.isArray(todos) 
        ? todos.filter(t => {
            const todoUserId = parseInt(t.user_id, 10);
            return !isNaN(todoUserId) && todoUserId === numericUserId;
          })
        : [];
      
      return createResponse(filteredTodos, 200);
    } catch (err) {
      console.error('[Todos] Trash query error:', err.message);
      return createResponse({ error: 'Database query failed' }, 500);
    }
  }

  // POST /api/todo
  if (req.method === 'POST' && pathname === '/api/todo') {
    try {
      const body = await parseBody(req);
      const { text, user_id, expiry_date } = body;

      // Use user_id from body or from request (headers/query)
      const finalUserId = user_id || userId;

      if (!text) {
        return createResponse({ error: 'Text is required' }, 400);
      }
      
      if (!finalUserId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }

      const newTodo = await fastInsert('todos', {
        text,
        user_id: finalUserId,
        completed: false,
        is_deleted: false,
        expiry_date: expiry_date || null
      }, 3000);

      return createResponse(newTodo, 201);
    } catch (err) {
      console.error('[Todos] Insert error:', err.message);
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // PUT /api/todo/:id
  if (req.method === 'PUT' && id && pathname.startsWith('/api/todo/')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      // Verify ownership
      const existingTodo = await fastQuery('todos', {
        filters: { 'id': id, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingTodo || existingTodo.length === 0) {
        return createResponse({ error: 'Todo not found or access denied' }, 404);
      }

      const body = await parseBody(req);
      const { text, completed, expiry_date } = body;

      const updateData = {};
      if (text !== undefined) updateData.text = text;
      if (completed !== undefined) updateData.completed = completed;
      if (expiry_date !== undefined) updateData.expiry_date = expiry_date;

      const updatedTodo = await fastUpdate('todos', id, updateData, 3000);
      return createResponse(updatedTodo || { error: 'Todo not found' }, updatedTodo ? 200 : 404);
    } catch (err) {
      console.error('[Todos] Update error:', err.message);
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // PUT /api/todo/:id/restore
  if (req.method === 'PUT' && action === 'restore' && pathname.includes('/restore')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const todoId = secondLastPart;
      
      // Verify ownership
      const existingTodo = await fastQuery('todos', {
        filters: { 'id': todoId, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingTodo || existingTodo.length === 0) {
        return createResponse({ error: 'Todo not found or access denied' }, 404);
      }
      
      const updatedTodo = await fastUpdate('todos', todoId, {
        is_deleted: false,
        deleted_at: null
      }, 3000);
      return createResponse(updatedTodo || { error: 'Todo not found' }, updatedTodo ? 200 : 404);
    } catch (err) {
      console.error('[Todos] Restore error:', err.message);
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // DELETE /api/todo/:id (soft delete)
  if (req.method === 'DELETE' && id && pathname.startsWith('/api/todo/')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      // Verify ownership
      const existingTodo = await fastQuery('todos', {
        filters: { 'id': id, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingTodo || existingTodo.length === 0) {
        return createResponse({ error: 'Todo not found or access denied' }, 404);
      }
      
      const updatedTodo = await fastUpdate('todos', id, {
        is_deleted: true,
        deleted_at: new Date().toISOString()
      }, 3000);
      return createResponse({ message: 'Todo deleted successfully' }, 200);
    } catch (err) {
      console.error('[Todos] Delete error:', err.message);
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // DELETE /api/todo/:id/permanent (hard delete)
  if (req.method === 'DELETE' && action === 'permanent' && pathname.includes('/permanent')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const todoId = secondLastPart;
      
      // Verify ownership
      const existingTodo = await fastQuery('todos', {
        filters: { 'id': todoId, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingTodo || existingTodo.length === 0) {
        return createResponse({ error: 'Todo not found or access denied' }, 404);
      }
      
      await fastDelete('todos', todoId, 3000);
      return createResponse({ message: 'Todo permanently deleted' }, 200);
    } catch (err) {
      console.error('[Todos] Permanent delete error:', err.message);
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};
