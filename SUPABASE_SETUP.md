# Supabase Setup Guide for Digital Diary

This guide will help you convert your MySQL database to Supabase (PostgreSQL) and set it up properly.

## 📋 Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created
3. Access to your Supabase project dashboard

## 🚀 Quick Setup Steps

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Project Name**: `digital-diary` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project" (takes 2-3 minutes)

### Step 2: Access the SQL Editor

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query**

### Step 3: Run the Migration

1. Open the file `digital_diary_supabase.sql` in this project
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 4: Verify the Tables

1. Go to **Table Editor** in the Supabase dashboard
2. You should see these tables:
   - `users`
   - `entries`
   - `moods`
   - `notes`
   - `tasks`
   - `todos`

## 🔧 Key Changes Made for Supabase Compatibility

### Data Type Conversions

| MySQL/MariaDB | PostgreSQL (Supabase) |
|--------------|----------------------|
| `int(11)` | `INTEGER` or `SERIAL` |
| `tinyint(1)` | `BOOLEAN` |
| `varchar(255)` | `VARCHAR(255)` |
| `text` | `TEXT` |
| `datetime` | `TIMESTAMP` |
| `timestamp` | `TIMESTAMP` |
| `bigint(20)` | `BIGINT` |
| `enum('Low','Medium','High')` | `VARCHAR` with `CHECK` constraint |
| `longblob` | **Removed** (use Supabase Storage instead) |

### Removed MySQL-Specific Features

- ❌ `ENGINE=InnoDB` (not needed in PostgreSQL)
- ❌ `CHARSET=utf8mb4` (PostgreSQL uses UTF-8 by default)
- ❌ `COLLATE=utf8mb4_general_ci` (not needed)
- ❌ `AUTO_INCREMENT` (replaced with `SERIAL`)
- ❌ `ON UPDATE current_timestamp()` (replaced with triggers)
- ❌ Backticks around identifiers (PostgreSQL uses double quotes if needed)

### Added PostgreSQL Features

- ✅ `SERIAL` for auto-incrementing IDs
- ✅ Triggers for auto-updating `updated_at` timestamps
- ✅ Row Level Security (RLS) policies for data protection
- ✅ Foreign key constraints with `ON DELETE CASCADE`

## 🔐 Row Level Security (RLS)

The SQL file includes RLS policies that:
- Allow users to only access their own data
- Use Supabase Auth's `auth.uid()` function

**Important**: If you're using **custom authentication** (not Supabase Auth), you have two options:

### Option A: Disable RLS (for custom auth)
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE moods DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
```

### Option B: Modify RLS Policies
If you store user IDs differently, modify the policies in the SQL file to match your auth system.

## 📦 Audio File Storage

**Important Change**: The `audio` BLOB column has been removed from the `notes` table.

### Supabase Storage Setup

Instead of storing audio files as BLOB in the database, use Supabase Storage:

1. **Create a Storage Bucket**:
   - Go to **Storage** in Supabase dashboard
   - Click **New bucket**
   - Name: `audio-files`
   - Make it **Public** (or Private with signed URLs)
   - Click **Create bucket**

2. **Update Your Application Code**:
   - Upload audio files to the `audio-files` bucket
   - Store the file path/URL in `audio_filename` column
   - Use Supabase Storage SDK to upload/download files

Example (JavaScript):
```javascript
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Upload audio file
const uploadAudio = async (file, userId) => {
  const fileName = `audio-${Date.now()}-${userId}.webm`;
  const { data, error } = await supabase.storage
    .from('audio-files')
    .upload(fileName, file);
  
  if (error) throw error;
  return fileName; // Store this in audio_filename column
};

// Get audio URL
const getAudioUrl = (fileName) => {
  const { data } = supabase.storage
    .from('audio-files')
    .getPublicUrl(fileName);
  return data.publicUrl;
};
```

## 🔌 Connecting Your Application

### Get Your Supabase Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: Your public anonymous key
   - **Service Role Key**: Your service role key (keep secret!)

### Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Create Supabase Client

Create `server/config/supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use anon key for client-side

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

### Update Your .env File

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📝 Migration Checklist

- [ ] Created Supabase project
- [ ] Ran `digital_diary_supabase.sql` in SQL Editor
- [ ] Verified all tables exist in Table Editor
- [ ] Created `audio-files` storage bucket
- [ ] Updated RLS policies (if using custom auth)
- [ ] Installed `@supabase/supabase-js` package
- [ ] Created Supabase client configuration
- [ ] Updated `.env` with Supabase credentials
- [ ] Updated application code to use Supabase instead of MySQL
- [ ] Tested database connections
- [ ] Tested audio file uploads to Storage

## 🔄 Converting Your Application Code

### Old MySQL Connection (remove):
```javascript
const mysql = require('mysql2');
const connection = mysql.createConnection({...});
```

### New Supabase Connection:
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
```

### Example Query Conversion

**MySQL**:
```javascript
connection.query('SELECT * FROM entries WHERE user_id = ?', [userId], callback);
```

**Supabase**:
```javascript
const { data, error } = await supabase
  .from('entries')
  .select('*')
  .eq('user_id', userId);
```

## 🐛 Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the SQL file completely
- Check that you're in the correct database schema (usually `public`)

### Error: "permission denied"
- Check your RLS policies
- Verify you're using the correct API key (service role key for admin operations)

### Audio files not working
- Ensure you created the storage bucket
- Check bucket permissions (public vs private)
- Verify file upload paths are correct

### Foreign key constraint errors
- Make sure to insert users before inserting entries/notes/etc.
- Check that `user_id` values exist in the `users` table

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)

## 🆘 Need Help?

If you encounter issues:
1. Check the Supabase dashboard logs (Settings → Logs)
2. Review the SQL Editor for any error messages
3. Verify your API keys are correct
4. Check that tables were created successfully

---

**Note**: This migration converts your schema but does not migrate existing data. To migrate data, you'll need to export from MySQL and import into Supabase, or write a migration script.

