# Supabase Storage Setup for Audio Files

This guide will help you set up Supabase Storage to store audio recordings for your Digital Diary application.

## Step 1: Create the Storage Bucket

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `fienoaiknaryjhvsyfhr`
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure the bucket:
   - **Name**: `audio-recordings`
   - **Public bucket**: ✅ Check this if you want public read access (recommended for audio files)
   - **File size limit**: Set to your preference (e.g., 50MB)
   - **Allowed MIME types**: Leave empty or add: `audio/webm,audio/mpeg,audio/wav,audio/ogg`
6. Click **"Create bucket"**

### Option B: Via SQL (Alternative)

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the bucket (requires service_role key)
-- Note: This must be done via the Storage API or Dashboard
-- The bucket creation is not available via SQL directly
```

## Step 2: Set Up Storage Policies

Run the SQL file `STORAGE_POLICIES_ONLY.sql` (or `supabase_storage_setup.sql`) in your Supabase SQL Editor:

**Note**: This SQL file ONLY contains storage policies. Your database tables (notes, users, etc.) are already created, so you don't need to recreate them!

1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **"New query"**
3. Copy and paste the contents of `supabase_storage_setup.sql`
4. Click **"Run"**

### What the Policies Do:

- **Authenticated uploads**: Users can upload audio files
- **Public reads**: Anyone can read/download audio files (if bucket is public)
- **Authenticated deletes**: Users can delete their own audio files
- **Service role access**: Backend has full access for server-side operations

## Step 3: Verify Setup

### Test the Bucket:

1. Go to **Storage** > **audio-recordings**
2. Try uploading a test file manually
3. Verify the file appears and can be accessed

### Test via API:

```bash
# Test upload endpoint (replace with your actual audio file)
curl -X POST http://localhost:5000/api/notes/upload-audio \
  -F "audio=@test-audio.webm"

# Test download endpoint (replace with actual filename)
curl http://localhost:5000/api/notes/audio/audio_1234567890.webm
```

## Step 4: Environment Variables

Make sure your `.env` file has:

```env
SUPABASE_URL=https://fienoaiknaryjhvsyfhr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 5: Database Schema

The `notes` table already has the required columns:

- `audio_filename` (VARCHAR) - Stores the filename in storage
- `audio_duration` (INTEGER) - Duration in seconds
- `audio_size` (BIGINT) - File size in bytes
- `has_audio` (BOOLEAN) - Flag indicating if note has audio

No additional database changes needed!

## How It Works

1. **Upload**: When a user records audio, the frontend sends it to `/api/notes/upload-audio`
2. **Storage**: The API uploads the file to Supabase Storage bucket `audio-recordings`
3. **Database**: The API returns the filename, which is stored in the `notes` table
4. **Retrieval**: When playing audio, the frontend requests `/api/notes/audio/{filename}`
5. **Streaming**: The API retrieves the file from Supabase Storage and streams it to the client

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `audio-recordings`
- Verify the bucket exists in your Supabase Dashboard

### Error: "Failed to upload audio file"
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify storage policies are set up (Step 2)
- Check file size limits in bucket settings

### Error: "Audio file not found"
- Verify the filename exists in the storage bucket
- Check that the `audio_filename` in the database matches the file in storage

### Error: "Permission denied"
- Check storage policies (Step 2)
- If bucket is private, ensure users are authenticated
- If bucket is public, verify public read policy is set

## File Structure

```
audio-recordings/          (bucket)
  └── audio/               (folder)
      ├── audio_1234567890.webm
      ├── audio_1234567891.webm
      └── ...
```

## Security Notes

- **Public Bucket**: Anyone with the URL can access audio files
- **Private Bucket**: Only authenticated users can access files
- **Service Role Key**: Keep this secret! Never expose it in frontend code
- **File Validation**: Consider adding file type and size validation in production

## Next Steps

1. ✅ Create the bucket (Step 1)
2. ✅ Run the SQL policies (Step 2)
3. ✅ Test the upload/download endpoints
4. ✅ Record and save an audio note in your app
5. ✅ Verify the audio plays correctly

Your audio recording feature should now work! 🎉

