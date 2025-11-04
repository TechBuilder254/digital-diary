# Supabase Quick Start Guide

## 🎯 Which SQL File Should I Use?

### Use `digital_diary_supabase.sql` if:
- ✅ You're planning to use **Supabase Auth** (Supabase's built-in authentication)
- ✅ You want **Row Level Security (RLS)** enabled for extra security
- ✅ You want users to only access their own data automatically

### Use `digital_diary_supabase_no_rls.sql` if:
- ✅ You're using **custom authentication** (your own auth system)
- ✅ You want to handle permissions in your application code
- ✅ You're migrating from MySQL and want a simpler setup

## 📝 Quick Setup (3 Steps)

### 1. Choose Your SQL File
- **With RLS**: `digital_diary_supabase.sql`
- **Without RLS**: `digital_diary_supabase_no_rls.sql`

### 2. Run in Supabase
1. Open Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste your chosen SQL file
4. Click **Run** ✅

### 3. Verify Tables
- Go to **Table Editor**
- You should see: `users`, `entries`, `moods`, `notes`, `tasks`, `todos`

## 🔑 Main Differences from MySQL

| Feature | MySQL | Supabase (PostgreSQL) |
|---------|-------|----------------------|
| Auto-increment | `AUTO_INCREMENT` | `SERIAL` |
| Boolean | `tinyint(1)` | `BOOLEAN` |
| Timestamp update | `ON UPDATE current_timestamp()` | Triggers |
| BLOB storage | `longblob` column | Storage Bucket |
| Authentication | Custom users table | Supabase Auth (optional) |

## 📦 Audio Files Storage

**Important**: Audio files are NOT stored in the database anymore.

1. Create a Storage Bucket:
   - Dashboard → **Storage** → **New bucket**
   - Name: `audio-files`
   - Make it **Public**

2. Upload files to bucket, store filename in `audio_filename` column

## 🔧 Next Steps

1. **Get API Keys**: Settings → API → Copy URL and keys
2. **Install Supabase**: `npm install @supabase/supabase-js`
3. **Update Code**: Replace MySQL queries with Supabase queries
4. **See Full Guide**: Read `SUPABASE_SETUP.md` for detailed instructions

---

**That's it!** Your database is now Supabase-ready. 🎉

