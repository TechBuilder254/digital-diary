const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const { handleCORS, createResponse } = require('../helpers/handler');

module.exports = async (req) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    // Parse multipart/form-data
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return createResponse({ error: 'No audio file provided' }, 400);
    }

    // Check if it's a File-like object (has name, size, type, arrayBuffer)
    if (!audioFile.name || !audioFile.size || typeof audioFile.arrayBuffer !== 'function') {
      return createResponse({ error: 'Invalid file object' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = audioFile.name.split('.').pop() || 'webm';
    const filename = `audio_${timestamp}.${fileExtension}`;
    const filePath = `audio/${filename}`;

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // First, verify bucket exists and client can access it
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
      // If listing fails, try to create the bucket
      console.log('Attempting to create bucket via API...');
      const { data: createData, error: createError } = await supabase.storage.createBucket('audio-recordings', {
        public: true
      });
      if (createError) {
        console.error('Error creating bucket:', createError);
        // If bucket already exists, that's fine - continue
        if (!createError.message?.includes('already exists') && !createError.message?.includes('duplicate')) {
          return createResponse({ 
            error: 'Storage bucket error', 
            details: createError.message 
          }, 500);
        }
      }
    } else {
      const bucketExists = buckets?.some(b => b.id === 'audio-recordings');
      if (!bucketExists) {
        console.log('Bucket not found in list, attempting to create...');
        const { data: createData, error: createError } = await supabase.storage.createBucket('audio-recordings', {
          public: true
        });
        if (createError && !createError.message?.includes('already exists') && !createError.message?.includes('duplicate')) {
          console.error('Error creating bucket:', createError);
          return createResponse({ 
            error: 'Storage bucket not configured', 
            details: createError.message 
          }, 500);
        }
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-recordings')
      .upload(filePath, buffer, {
        contentType: audioFile.type || 'audio/webm',
        upsert: false // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      console.error('Supabase URL:', supabaseUrl);
      console.error('Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      return createResponse({ 
        error: 'Failed to upload audio file to storage', 
        details: uploadError.message,
        code: uploadError.statusCode
      }, 500);
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('audio-recordings')
      .getPublicUrl(filePath);

    return createResponse({
      success: true,
      filename: filename,
      path: filePath,
      url: urlData.publicUrl,
      size: audioFile.size,
      type: audioFile.type
    }, 200);

  } catch (error) {
    console.error('Error processing audio upload:', error);
    return createResponse({ 
      error: 'Failed to process audio upload', 
      details: error.message 
    }, 500);
  }
};

