# Cleanup Guide - Removing Old Server Code

Since you've converted to Vercel serverless functions, the old Express server code is **no longer needed** for production deployment.

## 🗑️ What Can Be Removed

### Option 1: Complete Removal (Recommended for Vercel-only)

If you're **only deploying to Vercel**, you can remove:

```
server/
├── server.js          ❌ Remove (replaced by api/ functions)
├── routes/            ❌ Remove (replaced by api/ functions)
│   ├── auth.js
│   ├── entries.js
│   ├── moods.js
│   ├── Notes.js
│   ├── tasks.js
│   ├── todo.js
│   └── user.js
└── config/
    └── db.js          ⚠️  Keep (still used by api/ functions)
```

**Keep:**
- `server/config/db.js` - Still needed by serverless functions
- `server/uploads/` - Keep for now (migrate to Supabase Storage later)

### Option 2: Keep for Local Development (Optional)

If you want to **test locally with Express**, keep the server code but:
- Update `package.json` scripts to use `vercel dev` instead
- Or keep both for flexibility

## 📝 Cleanup Steps

### Step 1: Remove Old Server Files

```bash
# Remove Express server and routes
rm -rf server/server.js
rm -rf server/routes/
```

### Step 2: Update package.json Scripts (Optional)

You can remove or keep these scripts for local development:

```json
{
  "scripts": {
    // Remove these if not using Express server locally:
    "server": "nodemon server/server.js",
    "start": "concurrently \"npm run server\" \"npm run client\"",
    
    // Keep or update to:
    "dev": "vercel dev",
    "start": "cd frontend && npm start"
  }
}
```

### Step 3: Clean Up Dependencies (Optional)

You can remove Express-related dependencies if not needed:

```bash
npm uninstall express cors
# Keep: @supabase/supabase-js, bcrypt, dotenv
```

## ⚠️ Important Notes

1. **Database Config**: Keep `server/config/db.js` - it's still used by serverless functions
2. **Audio Files**: The `server/uploads/` directory won't work in Vercel. Migrate to Supabase Storage
3. **Local Testing**: Use `vercel dev` for local development instead of Express server

## 🔄 Migration Status

✅ **Converted to Vercel:**
- All API routes → `api/` directory
- Database connection → `server/config/db.js` (still used)
- CORS handling → In each serverless function

❌ **No longer needed:**
- Express server (`server/server.js`)
- Express routes (`server/routes/*`)
- Express middleware setup

## 🚀 Recommended Action

**For Vercel-only deployment:**
```bash
# Remove old server code
rm server/server.js
rm -rf server/routes/

# Keep these:
# - server/config/db.js (used by api/ functions)
# - server/uploads/ (migrate to Supabase Storage later)
```

**For local development:**
Use `vercel dev` instead of Express server.

