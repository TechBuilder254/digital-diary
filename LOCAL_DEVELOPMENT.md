# Local Development Guide

## ✅ Fixed Issues

1. **API URLs Updated**: All frontend API calls now use relative paths (`/api` instead of `http://localhost:5000/api`)
2. **Local Dev Server**: Created `server-dev.js` to run API functions locally
3. **Package Scripts**: Updated to run both API and frontend together

## 🚀 Running Locally

### Option 1: Start Everything (Recommended)

```bash
npm start
```

This will start:
- **API Server** on `http://localhost:5000`
- **Frontend** on `http://localhost:3000`

### Option 2: Start Separately

```bash
# Terminal 1 - API Server
npm run dev:api

# Terminal 2 - Frontend
npm run dev:frontend
```

## 📡 API Endpoints

All API endpoints are available at:
- `http://localhost:5000/api/auth/register`
- `http://localhost:5000/api/auth/login`
- `http://localhost:5000/api/entries`
- `http://localhost:5000/api/todos`
- `http://localhost:5000/api/tasks`
- `http://localhost:5000/api/moods`
- `http://localhost:5000/api/notes`
- `http://localhost:5000/api/users/profile/:id`

## 🔧 How It Works

1. **Frontend** runs on port 3000 (React)
2. **API Server** (`server-dev.js`) runs on port 5000
3. Frontend makes requests to `/api/*` which works because:
   - In development: React proxy (if configured) or absolute URLs
   - The frontend now uses relative paths that work with both setups

## 🐛 Troubleshooting

### Port 5000 Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### API Not Responding
- Check `.env` file has Supabase credentials
- Verify API server is running: `curl http://localhost:5000/api/entries`
- Check console for errors

### Frontend Can't Connect to API
- Ensure API server is running on port 5000
- Check browser console for CORS errors
- Verify API URLs are using relative paths (`/api` not `http://localhost:5000/api`)

## 📝 Next Steps

1. **Test Registration**: Try creating a new user
2. **Test Login**: Login with your credentials
3. **Test Features**: Try creating entries, todos, tasks, etc.

## 🚀 For Production (Vercel)

When ready to deploy:
```bash
npx vercel --prod
```

The frontend will automatically use the Vercel deployment URL for API calls.

