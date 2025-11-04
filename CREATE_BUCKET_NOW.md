# ⚠️ URGENT: Create Storage Bucket

## The Error
```
StorageApiError: Bucket not found
```

This means the bucket `audio-recordings` doesn't exist in your Supabase project yet.

## Quick Fix (2 minutes)

### Step 1: Go to Supabase Dashboard
Open: https://supabase.com/dashboard/project/fienoaiknaryjhvsyfhr/storage/buckets

### Step 2: Create Bucket
1. Click **"New bucket"** button (top right)
2. Fill in:
   - **Name**: `audio-recordings` (exactly this name, lowercase, with hyphen)
   - ✅ **Check "Public bucket"** (this allows public read access)
   - **File size limit**: Leave default or set to 50MB
3. Click **"Create bucket"**

### Step 3: Run SQL Policies
1. Go to: https://supabase.com/dashboard/project/fienoaiknaryjhvsyfhr/sql/new
2. Open `STORAGE_POLICIES_ONLY.sql` from your project
3. Copy all the SQL code
4. Paste into SQL Editor
5. Click **"Run"**

### Step 4: Test
Try recording audio again in your app - it should work now! 🎉

---

## Why This Happened
- ✅ Routing is working (no more 405 errors)
- ✅ File upload handler is working
- ❌ Bucket doesn't exist yet (needs to be created)

Once you create the bucket, everything will work!

