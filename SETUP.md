# Digital Diary - Cross-Platform Setup Guide

This guide will help you set up the Digital Diary application on both Windows and Mac systems.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **MySQL** database
- **Git** (for cloning the repository)

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd digital-diary-main
```

#### 2. Install Dependencies
```bash
# Install all dependencies (root and frontend)
npm run install:all
```

#### 3. Setup Directories
```bash
# Create necessary directories
npm run create-dirs
```

#### 4. Database Setup
1. Create a MySQL database named `digital_diary`
2. Import the database schema from `digital_diary.sql`
3. Update database credentials in `server/config/db.js` if needed

#### 5. Start the Application
```bash
# Start both server and client
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🖥️ Platform-Specific Instructions

### Windows Setup
```bash
# Use Windows-specific commands (if needed)
npm run start:windows
```

### Mac Setup
```bash
# Use Mac-specific commands (if needed)
npm run start:mac
```

## 📁 Directory Structure
```
digital-diary-main/
├── server/
│   ├── uploads/
│   │   └── audio/          # Audio files storage
│   ├── routes/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── scripts/
│   └── create-dirs.js      # Cross-platform directory creation
└── package.json
```

## 🔧 Audio Storage Features

### Cross-Platform Audio Storage
- **Windows**: Uses `C:\path\to\project\server\uploads\audio\`
- **Mac**: Uses `/path/to/project/server/uploads/audio/`
- **Linux**: Uses `/path/to/project/server/uploads/audio/`

### Audio File Handling
- **Supported Formats**: WebM, MP3, WAV, OGG
- **File Size Limit**: 10MB per recording
- **Storage**: Permanent server-side storage
- **Security**: Filename sanitization and path validation

## 🛠️ Troubleshooting

### Common Issues

#### 1. Permission Errors (Mac/Linux)
```bash
# Fix directory permissions
chmod -R 755 server/uploads/
```

#### 2. Port Already in Use
```bash
# Kill process using port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process using port 5000 (Mac/Linux)
lsof -ti:5000 | xargs kill -9
```

#### 3. Database Connection Issues
- Check MySQL service is running
- Verify database credentials in `server/config/db.js`
- Ensure database `digital_diary` exists

#### 4. Audio Upload Issues
- Check `server/uploads/audio/` directory exists
- Verify file permissions
- Check server logs for detailed error messages

### Development Commands

```bash
# Start only the server
npm run server

# Start only the frontend
npm run client

# Install dependencies
npm run install:all

# Create directories
npm run create-dirs

# Full setup (install + create dirs)
npm run setup
```

## 🔒 Security Features

### File Upload Security
- **Filename Sanitization**: Removes special characters
- **Path Validation**: Prevents directory traversal attacks
- **File Type Validation**: Only audio files allowed
- **Size Limits**: 10MB maximum file size

### Cross-Platform Security
- **Path Resolution**: Uses `path.resolve()` for secure path handling
- **Directory Isolation**: Uploads are isolated in dedicated directory
- **Permission Management**: Proper file permissions (0o755)

## 📝 Notes

- Audio files are stored permanently on the server
- Files persist across application restarts
- Cross-platform compatibility ensured through Node.js path module
- Automatic directory creation on startup
- Proper error handling for all file operations

## 🆘 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Ensure database is running and accessible
4. Check file permissions on upload directories

