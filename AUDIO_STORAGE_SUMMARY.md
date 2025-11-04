# Audio Storage Configuration - Complete Setup

## ✅ What Was Done

1. **Created Supabase Storage Integration**
   - Upload endpoint: `/api/notes/upload-audio`
   - Download endpoint: `/api/notes/audio/[filename]`
   - Server-side file handling with busboy

2. **Created SQL Setup File**
   - `supabase_storage_setup.sql` - Storage policies for the bucket

3. **Updated Local Development Server**
   - Added multipart/form-data handling
   - Added audio route routing
   - Installed busboy for file parsing

4. **Created Documentation**
   - `SUPABASE_STORAGE_SETUP.md` - Detailed setup guide
   - `QUICK_STORAGE_SETUP.md` - Quick 3-step setup
   - `supabase_storage_setup.sql` - SQL policies

## 📋 What You Need to Do

### 1. Create the Storage Bucket

**Via Dashboard:**
1. Go to: https://supabase.com/dashboard/project/fienoaiknaryjhvsyfhr/storage/buckets
2. Click **"New bucket"**
3. Name: `audio-recordings`
4. ✅ Check **"Public bucket"**
5. Click **"Create bucket"**

### 2. Run the SQL Policies

**Via SQL Editor:**
1. Go to: https://supabase.com/dashboard/project/fienoaiknaryjhvsyfhr/sql/new
2. Open `supabase_storage_setup.sql` from your project
3. Copy and paste the entire contents
4. Click **"Run"**

### 3. Restart Your Server

```bash
# Stop current server (Ctrl+C)
npm start
```

## 🎯 How It Works

```
User Records Audio
    ↓
Frontend: QuickAudioRecorder.js
    ↓
POST /api/notes/upload-audio (multipart/form-data)
    ↓
API: api/notes/upload-audio.js
    ↓
Upload to Supabase Storage: audio-recordings/audio/filename.webm
    ↓
Return: { filename, url, size }
    ↓
Save to Database: notes table (audio_filename, audio_duration, etc.)
    ↓
User Plays Audio
    ↓
GET /api/notes/audio/filename.webm
    ↓
API: api/notes/audio/[filename].js
    ↓
Download from Supabase Storage
    ↓
Stream to browser
```

## 📁 File Structure

```
api/
  └── notes/
      ├── index.js (existing)
      ├── upload-audio.js (NEW - handles uploads)
      └── audio/
          └── [filename].js (NEW - serves audio files)

supabase_storage_setup.sql (NEW - SQL policies)
SUPABASE_STORAGE_SETUP.md (NEW - detailed guide)
QUICK_STORAGE_SETUP.md (NEW - quick reference)
```

## 🔧 Technical Details

### Storage Bucket Structure
```
audio-recordings/          (Supabase Storage Bucket)
  └── audio/               (Folder)
      ├── audio_1234567890.webm
      ├── audio_1234567891.webm
      └── ...
```

### Database Schema
The `notes` table already has:
- `audio_filename` VARCHAR(255) - Stores filename
- `audio_duration` INTEGER - Duration in seconds
- `audio_size` BIGINT - File size in bytes
- `has_audio` BOOLEAN - Flag for audio presence

### API Endpoints

**Upload Audio:**
- **URL**: `POST /api/notes/upload-audio`
- **Body**: `multipart/form-data` with field `audio`
- **Response**: `{ filename, path, url, size, type }`

**Get Audio:**
- **URL**: `GET /api/notes/audio/{filename}`
- **Response**: Audio file stream with proper content-type headers

## 🧪 Testing

After setup, test with:

```bash
# Test upload (replace with actual audio file)
curl -X POST http://localhost:5000/api/notes/upload-audio \
  -F "audio=@test-audio.webm"

# Test download (replace with actual filename from upload response)
curl http://localhost:5000/api/notes/audio/audio_1234567890.webm \
  --output test-download.webm
```

## 🚨 Troubleshooting

### "Bucket not found"
- Verify bucket name is exactly `audio-recordings`
- Check bucket exists in Supabase Dashboard

### "Permission denied"
- Run the SQL policies from `supabase_storage_setup.sql`
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct in `.env`

### "Failed to upload"
- Check bucket is created and accessible
- Verify storage policies are applied
- Check file size limits in bucket settings

### "Audio file not found"
- Verify filename in database matches file in storage
- Check file path: should be `audio/{filename}`

## ✨ Next Steps

1. ✅ Create bucket (Step 1 above)
2. ✅ Run SQL policies (Step 2 above)
3. ✅ Restart server (Step 3 above)
4. ✅ Test recording audio in your app
5. ✅ Verify audio plays correctly

## 📚 Documentation Files

- **Quick Setup**: `QUICK_STORAGE_SETUP.md`
- **Detailed Guide**: `SUPABASE_STORAGE_SETUP.md`
- **SQL Policies**: `supabase_storage_setup.sql`

---

**That's it!** Your audio recording feature should now work with Supabase Storage! 🎉

