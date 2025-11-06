const { fastQuery, fastInsert, fastUpdate, fastDelete } = require('../../lib/supabase-rest');
const { handleCORS, createResponse, parseBody, getUserId } = require('../../lib/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  const url = new URL(req.url);
  const pathname = url.pathname;
  const pathParts = pathname.split('/').filter(p => p);
  const lastPart = pathParts[pathParts.length - 1];
  const id = lastPart && !isNaN(lastPart) && lastPart !== 'tasks' ? lastPart : null;

  // Get user_id from request
  const userId = getUserId(req);

  // GET /api/tasks - Fast query (filtered by user_id)
  if (req.method === 'GET' && !id && pathname === '/api/tasks') {
    try {
      if (!userId || userId === null || userId === undefined) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        return createResponse({ error: 'Invalid user ID' }, 401);
      }
      
      const tasks = await fastQuery('tasks', {
        filters: { 'user_id': numericUserId },
        timeout: 2000
      });
      
      // CRITICAL SAFETY CHECK
      const filteredTasks = Array.isArray(tasks) 
        ? tasks.filter(t => {
            const taskUserId = parseInt(t.user_id, 10);
            return !isNaN(taskUserId) && taskUserId === numericUserId;
          })
        : [];
      
      return createResponse(filteredTasks, 200);
    } catch (err) {
      console.error('[Tasks] Query error:', err.message);
      return createResponse({ error: 'Database query failed' }, 500);
    }
  }

  // POST /api/tasks
  if (req.method === 'POST' && pathname === '/api/tasks') {
    try {
      const body = await parseBody(req);
      const { title, description, deadline, user_id } = body;

      // Use user_id from body or from request (headers/query)
      const finalUserId = user_id || userId;

      if (!title || !deadline) {
        return createResponse({ error: 'Title and deadline are required' }, 400);
      }
      
      if (!finalUserId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }

      const newTask = await fastInsert('tasks', {
        title,
        description: description || null,
        deadline,
        user_id: finalUserId,
        is_completed: false
      }, 3000);

      return createResponse(newTask, 201);
    } catch (err) {
      console.error('[Tasks] Insert error:', err.message);
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // PUT /api/tasks/:id
  if (req.method === 'PUT' && id && pathname.startsWith('/api/tasks/')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      // Verify ownership
      const existingTask = await fastQuery('tasks', {
        filters: { 'id': id, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingTask || existingTask.length === 0) {
        return createResponse({ error: 'Task not found or access denied' }, 404);
      }

      const body = await parseBody(req);
      const { title, description, deadline, is_completed } = body;

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (deadline !== undefined) updateData.deadline = deadline;
      if (is_completed !== undefined) updateData.is_completed = is_completed;

      const updatedTask = await fastUpdate('tasks', id, updateData, 3000);
      return createResponse(updatedTask || { error: 'Task not found' }, updatedTask ? 200 : 404);
    } catch (err) {
      console.error('[Tasks] Update error:', err.message);
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // DELETE /api/tasks/:id
  if (req.method === 'DELETE' && id && pathname.startsWith('/api/tasks/')) {
    try {
      if (!userId) {
        return createResponse({ error: 'User ID is required' }, 401);
      }
      
      // Verify ownership
      const existingTask = await fastQuery('tasks', {
        filters: { 'id': id, 'user_id': userId },
        timeout: 2000
      });
      
      if (!existingTask || existingTask.length === 0) {
        return createResponse({ error: 'Task not found or access denied' }, 404);
      }
      
      await fastDelete('tasks', id, 3000);
      return createResponse({ message: 'Task deleted successfully' }, 200);
    } catch (err) {
      console.error('[Tasks] Delete error:', err.message);
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};
