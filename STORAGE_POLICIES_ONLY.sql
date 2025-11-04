-- ============================================
-- Storage Policies ONLY - For Existing Database
-- ============================================
-- This file contains ONLY the storage bucket policies
-- Your database tables are already created - no need to recreate them!
--
-- BEFORE RUNNING:
-- 1. Create bucket "audio-recordings" in Supabase Dashboard (Storage > New Bucket)
-- 2. Set it to Public
-- 3. Then run this SQL
-- ============================================

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

-- Policy: Allow public reads (if bucket is public)
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'audio-recordings'
);

