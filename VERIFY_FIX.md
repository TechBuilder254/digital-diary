# User Isolation Verification Guide

## Problem
Users can see data from other accounts because:
1. Old records were created with `user_id=1` (default value)
2. Frontend might not be sending Authorization header correctly
3. API might not be extracting user_id correctly

## What Was Fixed

### 1. API Endpoints
- ✅ All GET endpoints now filter by `user_id`
- ✅ All POST endpoints require `user_id` (no default to 1)
- ✅ All UPDATE/DELETE endpoints verify ownership
- ✅ Added detailed logging to track user_id extraction

### 2. Frontend
- ✅ All `fetch()` calls replaced with configured `axios` instance
- ✅ Axios interceptor automatically adds Authorization header
- ✅ Axios interceptor adds `user_id` as query param (fallback)

### 3. Database
- ✅ Schema requires `user_id` (NOT NULL)
- ✅ Foreign keys ensure data integrity
- ✅ Indexes on `user_id` for performance

## How to Verify the Fix

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Log in with a user account
4. Look for these logs:
   - `[Axios] Added Authorization header with token`
   - `[Axios] Added user_id to query params: [number]`
   - `[getUserId] Extracted user_id from token: [number]`
   - `[Entries GET] Querying entries for user_id: [number]`

### Step 2: Test with Different Users
1. Log in as User A
2. Create some entries/tasks/notes
3. Log out completely
4. Log in as User B
5. Verify User B only sees their own data (not User A's)

### Step 3: Check Server Logs
When making API requests, you should see:
```
[getUserId] Found Authorization header: Bearer jwt-token-...
[getUserId] Extracted user_id from token: [number]
[Entries GET] Querying entries for user_id: [number]
[fastQuery] Added filter: user_id=eq.[number]
[Entries GET] Found X entries for user [number]
```

### Step 4: Database Verification
Run the test script:
```bash
node test-user-isolation.js
```

This will show:
- How many records each user has
- If there are any orphaned records
- If filtering is working correctly

## If Users Still See Other Data

### Check 1: Authorization Header
Open Network tab in DevTools:
1. Make a request to `/api/entries`
2. Check Request Headers
3. Verify `Authorization: Bearer jwt-token-[id]` is present

### Check 2: Query Parameters
Check the request URL:
- Should include `?user_id=[number]` for GET requests

### Check 3: Server Logs
Check server console for:
- `[getUserId] No user_id found` - means header/params not being sent
- `[Entries GET] No user_id found - returning 401` - API rejecting request

### Check 4: Clear Cache
1. Clear browser localStorage: `localStorage.clear()`
2. Clear browser cache
3. Log out and log back in
4. Test again

## Database Cleanup (Optional)

If you want to clean up old data with `user_id=1`:

```sql
-- See what would be deleted (run first to check)
SELECT COUNT(*) FROM entries WHERE user_id = 1;
SELECT COUNT(*) FROM tasks WHERE user_id = 1;
SELECT COUNT(*) FROM todos WHERE user_id = 1;
SELECT COUNT(*) FROM moods WHERE user_id = 1;
SELECT COUNT(*) FROM notes WHERE user_id = 1;

-- Delete old test data (only if you're sure!)
-- DELETE FROM entries WHERE user_id = 1;
-- DELETE FROM tasks WHERE user_id = 1;
-- DELETE FROM todos WHERE user_id = 1;
-- DELETE FROM moods WHERE user_id = 1;
-- DELETE FROM notes WHERE user_id = 1;
```

## Summary

The system now:
1. ✅ Extracts `user_id` from Authorization header or query params
2. ✅ Filters all queries by `user_id`
3. ✅ Verifies ownership before updates/deletes
4. ✅ Requires `user_id` for all new records
5. ✅ Logs all operations for debugging

If issues persist, check the logs to see where the `user_id` extraction is failing.

