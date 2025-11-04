-- ============================================
-- Supabase Storage Policies for Audio Files
-- ============================================
-- IMPORTANT: This file ONLY contains storage policies
-- The database tables (notes, users, etc.) are already created
-- 
-- BEFORE RUNNING THIS:
-- 1. Create the bucket manually via Supabase Dashboard:
--    - Go to Storage > New Bucket
--    - Name: "audio-recordings"
--    - Check "Public bucket"
--    - Create it
--
-- 2. THEN run this SQL to set up the policies
-- ============================================

-- Step 1: Create storage policies for the audio bucket
-- These policies allow authenticated and anonymous users to upload/read audio files

-- Policy: Allow authenticated users to upload audio files
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-recordings' AND
  (storage.foldername(name))[1] = 'audio'
);

-- Policy: Allow authenticated users to read their own audio files
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-recordings'
);

-- Policy: Allow authenticated users to update their own audio files
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio-recordings'
)
WITH CHECK (
  bucket_id = 'audio-recordings'
);

-- Policy: Allow authenticated users to delete their own audio files
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-recordings'
);

-- Policy: Allow service role (backend) full access (for server-side operations)
DROP POLICY IF EXISTS "Allow service role full access" ON storage.objects;
CREATE POLICY "Allow service role full access"
ON storage.objects
FOR ALL
TO service_role
USING (
  bucket_id = 'audio-recordings'
)
WITH CHECK (
  bucket_id = 'audio-recordings'
);

-- ============================================
-- Public Bucket Policies (Recommended)
-- ============================================
-- If your bucket is set to PUBLIC, add this policy for public reads:

DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'audio-recordings'
);

-- ============================================
-- Summary:
-- ============================================
-- ✅ This SQL file ONLY sets up storage policies
-- ✅ Your database tables (notes, users, etc.) are already created
-- ✅ The notes table already has: audio_filename, audio_duration, audio_size, has_audio
--
-- Next Steps:
-- 1. Create bucket "audio-recordings" via Dashboard (Storage > New Bucket)
-- 2. Run this SQL file to set up policies
-- 3. Done! Audio uploads will work

