# Vercel Deployment Guide

Your Digital Diary application has been converted to be Vercel-compatible! 🚀

## 📁 Project Structure

```
digital-diary/
├── api/                    # Serverless functions (Vercel)
│   ├── auth/
│   │   ├── register.js
│   │   ├── login.js
│   │   └── forgot-password.js
│   ├── entries/
│   │   └── index.js
│   ├── users/
│   │   └── [id].js
│   ├── todos/
│   │   └── index.js
│   ├── tasks/
│   │   └── index.js
│   ├── moods/
│   │   └── index.js
│   ├── notes/
│   │   └── index.js
│   └── helpers/
│       └── handler.js
├── frontend/               # React frontend
├── vercel.json            # Vercel configuration
└── .env                   # Environment variables (local only)
```

## 🚀 Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 2. Set Up Environment Variables in Vercel

**Option A: Via Vercel Dashboard**
1. Go to your project on [vercel.com](https://vercel.com)
2. Go to **Settings** → **Environment Variables**
3. Add these variables:
   - `SUPABASE_URL` = `https://fienoaiknaryjhvsyfhr.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`
   - `SUPABASE_ANON_KEY` = `your-anon-key`

**Option B: Via Vercel CLI**
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_ANON_KEY
```

### 3. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Vercel will auto-detect the configuration
4. Click **Deploy**

**Option B: Via Vercel CLI**
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (first time) or **Yes** (if updating)
- Project name? (Press Enter for default)
- Directory? (Press Enter for `.`)

### 4. Build Configuration

Vercel will automatically:
- Build your React frontend from `frontend/`
- Deploy serverless functions from `api/`
- Serve static files from `frontend/build/`

## 🔧 Build Scripts

Add these to your `frontend/package.json`:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "vercel-build": "npm run build"
  }
}
```

## 📝 API Endpoints

All your API endpoints are now serverless functions:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/entries` - Get all entries
- `POST /api/entries` - Create entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update profile
- `PUT /api/users/profile/:id/password` - Change password
- `GET /api/users/profile/:id/stats` - Get user stats
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo (soft)
- `DELETE /api/todos/:id/permanent` - Permanent delete
- `PUT /api/todos/:id/restore` - Restore from trash
- `GET /api/todos/trash` - Get deleted todos
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/moods` - Get all moods
- `POST /api/moods` - Create mood
- `DELETE /api/moods/:id` - Delete mood
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `PATCH /api/notes/:id/favorite` - Toggle favorite
- `GET /api/notes/favorites` - Get favorite notes
- `GET /api/notes/category/:category` - Get notes by category
- `DELETE /api/notes/:id` - Delete note

## 🔄 Frontend API Configuration

Update your frontend API base URL to use your Vercel deployment:

**For production:**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://your-project.vercel.app/api';
```

**For development:**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## 📦 Differences from Express Server

### 1. **Serverless Functions**
- Each API route is now a separate serverless function
- Functions are stateless (no persistent connections)
- Each function has a 30-second timeout (configurable)

### 2. **Request/Response Format**
- Uses Web API `Request` and `Response` objects instead of Express `req`/`res`
- CORS is handled in each function
- Body parsing is done manually

### 3. **File Uploads**
- Audio files should use Supabase Storage instead of local file system
- Local file uploads won't work in serverless environment
- See `SUPABASE_SETUP.md` for storage migration

### 4. **Environment Variables**
- Set in Vercel dashboard, not `.env` file
- Variables are encrypted and secure
- Available to all functions

## 🐛 Troubleshooting

### Error: "Function timeout"
- Default timeout is 10 seconds
- Increased to 30 seconds in `vercel.json`
- For longer operations, consider background jobs

### Error: "Module not found"
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify
- Check that `node_modules` is not in `.gitignore` incorrectly

### Error: "Environment variable not found"
- Verify variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding environment variables

### CORS Issues
- CORS is handled in each function
- Check `api/helpers/handler.js` for CORS headers
- Verify frontend URL is allowed

### Database Connection Issues
- Verify Supabase credentials in environment variables
- Check Supabase project is active
- Review Supabase logs for connection errors

## 📊 Performance Optimization

1. **Cold Starts**: First request may be slower (~1-2 seconds)
2. **Caching**: Consider adding caching headers for static data
3. **Database**: Use connection pooling (Supabase handles this)
4. **Bundle Size**: Optimize serverless function bundle sizes

## 🔒 Security

1. **Never commit `.env` file**
2. **Use service role key only in serverless functions**
3. **Use anon key for client-side operations**
4. **Enable CORS only for your frontend domain**
5. **Use environment variables for all secrets**

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Supabase Documentation](https://supabase.com/docs)

## ✨ Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set environment variables
3. ✅ Test API endpoints
4. ⏳ Update frontend API URLs
5. ⏳ Migrate audio files to Supabase Storage
6. ⏳ Set up custom domain (optional)

---

**Your application is now ready for Vercel deployment!** 🎉

