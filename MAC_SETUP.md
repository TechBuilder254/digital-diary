# MacBook Setup Guide - Digital Diary

## 🚨 **Browser Not Opening Issue - SOLVED**

If the MySQL database connects successfully but the browser doesn't open automatically, follow these steps:

### **Quick Fix (Immediate Solution)**
1. After running `npm start`, manually open your browser
2. Navigate to: `http://localhost:3000`
3. The application should load normally

### **Alternative Startup Commands**

#### Option 1: Disable Auto-Browser Opening
```bash
# This prevents the browser from auto-opening
npm run start:mac-no-browser
```
Then manually open: `http://localhost:3000`

#### Option 2: Standard Mac Startup
```bash
# Standard startup (may or may not auto-open browser)
npm run start:mac
```

#### Option 3: Manual Component Start
```bash
# Terminal 1: Start the server
npm run server

# Terminal 2: Start the frontend (in a new terminal window)
cd frontend && npm run start:mac
```

### **Verification Steps**

1. **Check Server Status:**
   ```bash
   # Should show: "Server is running on http://0.0.0.0:5000"
   npm run server
   ```

2. **Check Frontend Status:**
   ```bash
   # Should show: "Local: http://localhost:3000"
   cd frontend && npm run start:mac
   ```

3. **Manual Browser Test:**
   - Open Safari, Chrome, or Firefox
   - Go to `http://localhost:3000`
   - You should see the Digital Diary login page

### **Common Mac-Specific Issues**

#### Issue 1: Port Already in Use
```bash
# Kill any process using port 5000 or 3000
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

#### Issue 2: Permission Errors
```bash
# Fix directory permissions
chmod -R 755 server/uploads/
```

#### Issue 3: Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm run install:all
```

#### Issue 4: macOS Security Restrictions
- Go to System Preferences > Security & Privacy > Privacy
- Allow Node.js and Terminal to access network connections
- Restart Terminal after making changes

### **Network Configuration**

The server now binds to all network interfaces (`0.0.0.0`) instead of just `localhost`. This provides:
- Better cross-platform compatibility
- Network access if needed
- Consistent behavior across different macOS versions

### **Expected Console Output**

**Server Console:**
```
Connected to MySQL database: digital_diary
Server is running on http://0.0.0.0:5000
Local access: http://localhost:5000
Network access: http://0.0.0.0:5000
```

**Frontend Console:**
```
Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

### **Troubleshooting Checklist**

- [ ] MySQL is running and accessible
- [ ] Node.js version 14+ is installed
- [ ] All dependencies are installed (`npm run install:all`)
- [ ] No firewall blocking ports 3000/5000
- [ ] Browser manually navigated to `http://localhost:3000`
- [ ] Console shows no error messages

### **Still Having Issues?**

1. Check the terminal output for error messages
2. Try a different browser (Chrome, Safari, Firefox)
3. Clear browser cache and cookies
4. Restart your Mac and try again
5. Check if antivirus software is blocking connections

---

**Note:** The auto-browser opening feature may not work on all macOS configurations due to security settings. Manual browser navigation is the most reliable method.
