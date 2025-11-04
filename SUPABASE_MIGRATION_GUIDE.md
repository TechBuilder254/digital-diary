# Supabase Migration Guide

Your codebase has been successfully migrated from MySQL to Supabase! 🎉

## ✅ What Was Changed

### 1. **Database Configuration**
- ✅ `server/config/db.js` - Now uses Supabase client instead of MySQL
- ✅ Removed `mysql2` dependency
- ✅ Added `@supabase/supabase-js` dependency

### 2. **All Route Files Converted**
- ✅ `server/routes/auth.js` - Authentication routes
- ✅ `server/routes/entries.js` - Diary entries
- ✅ `server/routes/user.js` - User profiles and stats
- ✅ `server/routes/todo.js` - Todo items
- ✅ `server/routes/tasks.js` - Tasks
- ✅ `server/routes/moods.js` - Mood tracking
- ✅ `server/routes/Notes.js` - Notes with audio support

## 📦 Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install `@supabase/supabase-js` and remove `mysql2`.

### 2. Set Up Environment Variables

Create or update your `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
# OR use ANON key for client-side operations
SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon public key** → `SUPABASE_ANON_KEY`

**⚠️ Important:** 
- Use `SUPABASE_SERVICE_ROLE_KEY` for server-side operations (bypasses RLS)
- Use `SUPABASE_ANON_KEY` for client-side operations (respects RLS)

### 3. Run Database Migration

1. Open Supabase Dashboard → **SQL Editor**
2. Copy and paste the contents of `digital_diary_supabase_no_rls.sql`
3. Click **Run**
4. Verify tables are created in **Table Editor**

### 4. Set Up Audio Storage (Optional)

If you want to use Supabase Storage for audio files instead of local storage:

1. **Create Storage Bucket:**
   - Go to **Storage** in Supabase dashboard
   - Click **New bucket**
   - Name: `audio-files`
   - Make it **Public** (or Private with signed URLs)
   - Click **Create bucket**

2. **Update Audio Upload Code** (optional):
   - Currently, audio files are stored locally
   - To use Supabase Storage, update `server/routes/Notes.js`
   - See example in `SUPABASE_SETUP.md`

## 🔄 Key Changes in Code

### Query Syntax Changes

**Before (MySQL):**
```javascript
db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
  // callback
});
```

**After (Supabase):**
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', id)
  .single();
```

### Error Handling

Supabase returns `{ data, error }` instead of callbacks:

```javascript
if (error) {
  return res.status(500).json({ error: error.message });
}
// Use data
res.json(data);
```

### Insert Operations

**Before:**
```javascript
db.query('INSERT INTO users (username, email) VALUES (?, ?)', [username, email], callback);
```

**After:**
```javascript
const { data, error } = await supabase
  .from('users')
  .insert([{ username, email }])
  .select()
  .single();
```

### Update Operations

**Before:**
```javascript
db.query('UPDATE users SET username = ? WHERE id = ?', [username, id], callback);
```

**After:**
```javascript
const { data, error } = await supabase
  .from('users')
  .update({ username })
  .eq('id', id)
  .select()
  .single();
```

### Delete Operations

**Before:**
```javascript
db.query('DELETE FROM users WHERE id = ?', [id], callback);
```

**After:**
```javascript
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', id)
  .select()
  .single();
```

## 🧪 Testing

### 1. Test Database Connection

Start your server:
```bash
npm run server
```

You should see:
```
✅ Connected to Supabase successfully
```

### 2. Test API Endpoints

```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

## 📝 Notes

### Data Type Differences

- **Boolean values**: MySQL uses `0/1`, Supabase uses `true/false`
- **Timestamps**: Both use `TIMESTAMP`, but Supabase uses `NOW()` instead of `CURRENT_TIMESTAMP`
- **Auto-increment**: MySQL uses `AUTO_INCREMENT`, Supabase uses `SERIAL`

### User ID Defaults

Some routes use `user_id || 1` as a default. In production, you should:
- Remove these defaults
- Always require `user_id` from authenticated user
- Validate `user_id` matches the authenticated user

### Audio Storage

Currently, audio files are stored locally in `server/uploads/audio/`. To migrate to Supabase Storage:

1. Create storage bucket (see above)
2. Update `server/routes/Notes.js` to use Supabase Storage API
3. Update frontend to use Supabase Storage URLs

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Check your `.env` file has correct `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Make sure there are no extra spaces or quotes

### Error: "relation does not exist"
- Run the SQL migration file in Supabase SQL Editor
- Check that tables are created in Table Editor

### Error: "permission denied"
- If using RLS, check your policies
- If using custom auth, make sure RLS is disabled or policies are updated

### Connection Issues
- Verify Supabase project is active (not paused)
- Check network connectivity
- Review Supabase dashboard logs

## 🚀 Next Steps

1. ✅ Run database migration
2. ✅ Set environment variables
3. ✅ Install dependencies
4. ✅ Test API endpoints
5. ⏳ (Optional) Migrate audio files to Supabase Storage
6. ⏳ (Optional) Set up Row Level Security policies
7. ⏳ (Optional) Implement proper JWT authentication

## 📚 Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [PostgreSQL vs MySQL Differences](https://supabase.com/docs/guides/database/postgres)

---

**Your application is now ready to use Supabase!** 🎉

