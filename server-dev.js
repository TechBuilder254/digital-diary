/**
 * Simple local development server for API functions
 * This allows testing without Vercel CLI login
 */

require('dotenv').config();
const http = require('http');
const url = require('url');
const { Readable } = require('stream');

// Import API handlers
const authHandler = require('./api/auth/index');
const entriesHandler = require('./api/entries/index');
const todosHandler = require('./api/todos/index');
const tasksHandler = require('./api/tasks/index');
const moodsHandler = require('./api/moods/index');
const notesHandler = require('./api/notes/index');

// Audio routes
const uploadAudioHandler = require('./api/notes/upload-audio');
const audioFileHandler = require('./api/notes/audio/[filename]');

// User routes
const userProfileHandler = require('./api/users/profile/[id]');
const userStatsHandler = require('./api/users/profile/[id]/stats');
const userPasswordHandler = require('./api/users/profile/[id]/password');

const PORT = 5000;

// Route mapping
const routes = {
  '/api/auth': authHandler,
  '/api/entries': entriesHandler,
  '/api/todo': todosHandler,
  '/api/tasks': tasksHandler,
  '/api/moods': moodsHandler,
  '/api/notes': notesHandler,
};

// Create server
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Check if this is a multipart/form-data request (file upload)
  const contentType = req.headers['content-type'] || '';
  const isMultipart = contentType.includes('multipart/form-data');

  // Handle multipart/form-data (file uploads)
  if (isMultipart) {
    return handleMultipartRequest(req, res, pathname, parsedUrl);
  }

  // Convert Node.js request to Web API Request (for JSON/text requests)
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      // Create a simple Headers-like object
      const headers = {
        get: (name) => req.headers[name.toLowerCase()],
        has: (name) => !!req.headers[name.toLowerCase()],
      };
      // Add iterator for compatibility
      headers[Symbol.iterator] = function* () {
        for (const [key, value] of Object.entries(req.headers)) {
          yield [key, value];
        }
      };

      // Create Web API compatible request
      // The URL should be the full path including the API path
      const request = {
        method: req.method,
        url: `http://localhost:${PORT}${pathname}${parsedUrl.search || ''}`,
        headers: headers,
        json: async () => body ? JSON.parse(body) : {},
        text: async () => body,
        formData: async () => null,
      };

      // Find handler
      let handler = null;

      // Debug logging
      console.log(`[${req.method}] ${pathname}${parsedUrl.search || ''}`);

      // IMPORTANT: Check specific routes BEFORE general ones
      // Check for auth route FIRST
      if (pathname === '/api/auth') {
        console.log('Found auth handler');
        handler = authHandler;
      }
      // Check for audio upload route (before /api/notes matches)
      else if (pathname === '/api/notes/upload-audio') {
        handler = uploadAudioHandler;
      }
      // Check for audio file route (e.g., /api/notes/audio/filename.webm)
      else if (pathname.match(/^\/api\/notes\/audio\/(.+)$/)) {
        handler = audioFileHandler;
      }
      // Check for user profile routes (most specific)
      else {
        const userStatsMatch = pathname.match(/^\/api\/users\/profile\/(\d+)\/stats$/);
        const userPasswordMatch = pathname.match(/^\/api\/users\/profile\/(\d+)\/password$/);
        const userProfileMatch = pathname.match(/^\/api\/users\/profile\/(\d+)$/);

        if (userStatsMatch) {
          handler = userStatsHandler;
        } else if (userPasswordMatch) {
          handler = userPasswordHandler;
        } else if (userProfileMatch) {
          handler = userProfileHandler;
        } else {
          // Check exact matches
          if (routes[pathname]) {
            handler = routes[pathname];
          } else {
            // Try to match by prefix (for routes with IDs)
            // BUT exclude /api/notes/upload-audio and /api/notes/audio/* from prefix matching
            let matched = false;
            for (const [route, routeHandler] of Object.entries(routes)) {
              if (pathname === route) {
                handler = routeHandler;
                matched = true;
                break;
              } else if (pathname.startsWith(route + '/')) {
                // Don't match if it's an audio route
                if (!pathname.startsWith('/api/notes/upload-audio') && 
                    !pathname.startsWith('/api/notes/audio/')) {
                  handler = routeHandler;
                  matched = true;
                  break;
                }
              }
            }
            if (!matched && pathname.startsWith('/api/notes/')) {
              // Fallback to notes handler for other /api/notes/* routes
              handler = notesHandler;
            }
          }
        }
      }

      if (!handler) {
        console.log(`No handler found for ${pathname}`);
        console.log('Available routes:', Object.keys(routes));
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found', pathname }));
        return;
      }

      console.log(`Calling handler for ${pathname}`);

      // Call handler
      const response = await handler(request);

      // Extract headers from Response object
      const responseHeaders = {};
      if (response.headers && response.headers.forEach) {
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
      }

      // Check if this is a binary response (audio, images, etc.)
      const contentType = responseHeaders['content-type'] || responseHeaders['Content-Type'] || '';
      const isBinary = contentType.startsWith('audio/') || 
                      contentType.startsWith('image/') || 
                      contentType.startsWith('video/') ||
                      contentType === 'application/octet-stream';

      if (isBinary) {
        // Handle binary response (audio, images, etc.)
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        res.writeHead(response.status, responseHeaders);
        res.end(buffer);
      } else {
        // Handle text/JSON response
        const responseBody = await response.text();
        res.writeHead(response.status, {
          'Content-Type': 'application/json',
          ...responseHeaders,
        });
        res.end(responseBody);
      }
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
    }
  });
});

// Handle multipart/form-data requests (file uploads)
async function handleMultipartRequest(req, res, pathname, parsedUrl) {
  try {
    // Use busboy to parse multipart form data
    const Busboy = require('busboy');
    const busboy = Busboy({ headers: req.headers });
    
    const formData = new Map();
    const files = new Map();

    busboy.on('file', (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      const chunks = [];
      
      file.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        // Create a File-like object
        const fileObj = {
          name: filename,
          type: mimeType,
          size: buffer.length,
          arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
          stream: () => Readable.from(buffer),
        };
        files.set(fieldname, fileObj);
      });
    });

    busboy.on('field', (fieldname, value) => {
      formData.set(fieldname, value);
    });

    busboy.on('finish', async () => {
      try {
        // Create a FormData-like object
      const formDataObj = {
        get: (name) => {
          if (files.has(name)) return files.get(name);
          return formData.get(name) || null;
        },
        has: (name) => files.has(name) || formData.has(name),
        entries: function* () {
          for (const [key, value] of formData.entries()) {
            yield [key, value];
          }
          for (const [key, value] of files.entries()) {
            yield [key, value];
          }
        },
      };

        // Create headers
        const headers = {
          get: (name) => req.headers[name.toLowerCase()],
          has: (name) => !!req.headers[name.toLowerCase()],
        };
        headers[Symbol.iterator] = function* () {
          for (const [key, value] of Object.entries(req.headers)) {
            yield [key, value];
          }
        };

        // Create Web API compatible request
        const request = {
          method: req.method,
          url: `http://localhost:${PORT}${pathname}${parsedUrl.search || ''}`,
          headers: headers,
          json: async () => ({}),
          text: async () => '',
          formData: async () => formDataObj,
        };

        // Find handler for multipart requests
        let handler = null;
        if (pathname === '/api/notes/upload-audio') {
          handler = uploadAudioHandler;
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        if (!handler) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        // Call handler
        const response = await handler(request);

        // Extract headers from Response object
        const responseHeaders = {};
        if (response.headers && response.headers.forEach) {
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });
        }

        // Check if this is a binary response
        const contentType = responseHeaders['content-type'] || responseHeaders['Content-Type'] || '';
        const isBinary = contentType.startsWith('audio/') || 
                        contentType.startsWith('image/') || 
                        contentType.startsWith('video/') ||
                        contentType === 'application/octet-stream';

        if (isBinary) {
          // Handle binary response
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          res.writeHead(response.status, responseHeaders);
          res.end(buffer);
        } else {
          // Handle text/JSON response
          const responseBody = await response.text();
          res.writeHead(response.status, {
            'Content-Type': 'application/json',
            ...responseHeaders,
          });
          res.end(responseBody);
        }
      } catch (error) {
        console.error('Handler error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
      }
    });

    req.pipe(busboy);
  } catch (error) {
    console.error('Multipart parsing error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to parse form data', details: error.message }));
  }
}

server.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`\n✅ Ready to accept requests from frontend!\n`);
});

