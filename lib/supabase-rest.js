/**
 * Fast Supabase REST API client
 * Uses direct REST API calls instead of JS client for better performance in serverless
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

/**
 * Fast REST API query with timeout
 * @param {string} table - Table name
 * @param {Object} options - Query options
 * @param {Array<string>} options.select - Columns to select
 * @param {Object} options.filters - Filters object {column: value}
 * @param {string} options.orderBy - Column to order by
 * @param {boolean} options.ascending - Order direction
 * @param {number} options.limit - Limit results
 * @param {number} options.timeout - Timeout in ms (default: 2000)
 * @returns {Promise<Array>}
 */
async function fastQuery(table, options = {}) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const {
    select = '*',
    filters = {},
    orderBy,
    ascending = false,
    limit,
    timeout = 2000
  } = options;

  // Build query string
  const params = new URLSearchParams();
  
  if (select !== '*') {
    params.append('select', select);
  }
  
  // Add filters - handle boolean values properly
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Convert boolean to string for Supabase
      const filterValue = typeof value === 'boolean' ? value.toString() : value;
      const filterString = `eq.${encodeURIComponent(filterValue)}`;
      params.append(key, filterString);
      console.log(`[fastQuery] Added filter: ${key}=${filterString}`);
    }
  });
  
  // Add ordering
  if (orderBy) {
    params.append('order', `${orderBy}.${ascending ? 'asc' : 'desc'}`);
  }
  
  // Add limit
  if (limit) {
    params.append('limit', limit.toString());
  }

  const restUrl = `${supabaseUrl}/rest/v1/${table}?${params.toString()}`;
  console.log(`[fastQuery] Query URL: ${restUrl.substring(0, 100)}...`);

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(restUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Query timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Fast insert with timeout
 */
async function fastInsert(table, data, timeout = 3000) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const restUrl = `${supabaseUrl}/rest/v1/${table}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(restUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Insert timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Fast update with timeout
 */
async function fastUpdate(table, id, data, timeout = 3000) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const restUrl = `${supabaseUrl}/rest/v1/${table}?id=eq.${id}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(restUrl, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Update timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Fast delete with timeout
 */
async function fastDelete(table, id, timeout = 3000) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  const restUrl = `${supabaseUrl}/rest/v1/${table}?id=eq.${id}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(restUrl, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Delete timeout after ${timeout}ms`);
    }
    throw error;
  }
}

module.exports = {
  fastQuery,
  fastInsert,
  fastUpdate,
  fastDelete
};

