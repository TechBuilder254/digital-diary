# Quick Supabase Storage Setup Guide

## 🚀 3-Step Setup

### Step 1: Create Bucket (2 minutes)

1. Go to: https://supabase.com/dashboard/project/fienoaiknaryjhvsyfhr/storage/buckets
2. Click **"New bucket"**
3. Name: `audio-recordings`
4. ✅ Check **"Public bucket"**
5. Click **"Create bucket"**

### Step 2: Run SQL Policies (1 minute)

1. Go to: https://supabase.com/dashboard/project/fienoaiknaryjhvsyfhr/sql/new
2. Open `STORAGE_POLICIES_ONLY.sql` from your project (or `supabase_storage_setup.sql`)
3. Copy and paste the SQL code
4. Click **"Run"**

**Note**: This only adds storage policies. Your database tables are already created!

### Step 3: Test It! (30 seconds)

Restart your server:
```bash
npm start
```

Then try recording an audio note in your app. It should work! 🎉

---

## 📋 What You Need

- ✅ Supabase project URL and keys (already in your `.env`)
- ✅ Bucket named `audio-recordings`
- ✅ Storage policies (from SQL file)

## 🔍 Troubleshooting

**"Bucket not found"**
→ Make sure bucket name is exactly `audio-recordings`

**"Permission denied"**
→ Run the SQL policies (Step 2)

**"Failed to upload"**
→ Check your `SUPABASE_SERVICE_ROLE_KEY` in `.env`

---

For detailed setup, see `SUPABASE_STORAGE_SETUP.md`

