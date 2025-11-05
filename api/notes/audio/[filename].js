const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { handleCORS, createResponse } = require('../../../lib/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  // Only allow GET requests
  if (req.method !== 'GET') {
    return createResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Extract filename from path like /api/notes/audio/audio_1234567890.webm
    const parts = pathname.split('/');
    const filename = parts[parts.length - 1];
    
    if (!filename || filename === 'audio' || filename === 'notes') {
      return createResponse({ error: 'Invalid filename' }, 400);
    }

    const filePath = `audio/${filename}`;

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('audio-recordings')
      .download(filePath);

    if (downloadError) {
      console.error('Supabase download error:', downloadError);
      return createResponse({ 
        error: 'Audio file not found', 
        details: downloadError.message 
      }, 404);
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine content type based on file extension
    let contentType = 'audio/webm';
    if (filename.endsWith('.mp3')) {
      contentType = 'audio/mpeg';
    } else if (filename.endsWith('.wav')) {
      contentType = 'audio/wav';
    } else if (filename.endsWith('.ogg')) {
      contentType = 'audio/ogg';
    }

    // Return audio file with proper headers
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });

  } catch (error) {
    console.error('Error serving audio file:', error);
    return createResponse({ 
      error: 'Failed to serve audio file', 
      details: error.message 
    }, 500);
  }
};

