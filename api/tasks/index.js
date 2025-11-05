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
  const pathParts = pathname.split('/').filter(p => p);
  const lastPart = pathParts[pathParts.length - 1];
  // Check if last part is a number (ID) or the route name itself
  const id = lastPart && !isNaN(lastPart) && lastPart !== 'tasks' ? lastPart : null;

  // GET /api/tasks
  if (req.method === 'GET' && !id && pathname === '/api/tasks') {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) {
        return createResponse({ error: 'Database query error', details: error.message }, 500);
      }

      return createResponse(tasks || [], 200);
    } catch (err) {
      return createResponse({ error: 'Database query error', details: err.message }, 500);
    }
  }

  // POST /api/tasks
  if (req.method === 'POST' && pathname === '/api/tasks') {
    try {
      const body = await parseBody(req);
      const { title, description, deadline, user_id } = body;

      if (!title || !deadline) {
        return createResponse({ error: 'Title and deadline are required' }, 400);
      }

      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert([{
          title,
          description: description || null,
          deadline,
          user_id: user_id || 1
        }])
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database insert error', details: error.message }, 500);
      }

      return createResponse({ message: 'Task created', taskId: newTask.id, task: newTask }, 201);
    } catch (err) {
      return createResponse({ error: 'Database insert error', details: err.message }, 500);
    }
  }

  // PUT /api/tasks/:id
  if (req.method === 'PUT' && id && pathname.startsWith('/api/tasks/')) {
    try {
      const body = await parseBody(req);
      const { title, description, deadline, is_completed } = body;

      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({
          title,
          description,
          deadline,
          is_completed: is_completed !== undefined ? is_completed : false
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database update error', details: error.message }, 500);
      }

      if (!updatedTask) {
        return createResponse({ error: 'Task not found' }, 404);
      }

      return createResponse({ message: 'Task updated successfully', task: updatedTask }, 200);
    } catch (err) {
      return createResponse({ error: 'Database update error', details: err.message }, 500);
    }
  }

  // DELETE /api/tasks/:id
  if (req.method === 'DELETE' && id && pathname.startsWith('/api/tasks/')) {
    try {
      const { data: deletedTask, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return createResponse({ error: 'Database delete error', details: error.message }, 500);
      }

      if (!deletedTask) {
        return createResponse({ error: 'Task not found' }, 404);
      }

      return createResponse({ message: 'Task deleted successfully' }, 200);
    } catch (err) {
      return createResponse({ error: 'Database delete error', details: err.message }, 500);
    }
  }

  return createResponse({ message: 'Method not allowed' }, 405);
};

