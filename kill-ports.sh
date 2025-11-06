#!/bin/bash
# Script to kill processes on ports 5000 and 3000

echo "Killing processes on ports 5000 and 3000..."

# Kill processes on port 5000
if lsof -ti:5000 > /dev/null 2>&1; then
  lsof -ti:5000 | xargs kill -9
  echo "✅ Killed processes on port 5000"
else
  echo "ℹ️  Port 5000 is already free"
fi

# Kill processes on port 3000
if lsof -ti:3000 > /dev/null 2>&1; then
  lsof -ti:3000 | xargs kill -9
  echo "✅ Killed processes on port 3000"
else
  echo "ℹ️  Port 3000 is already free"
fi

# Kill any related node processes
pkill -9 -f "node.*server-dev" 2>/dev/null
pkill -9 -f "react-scripts" 2>/dev/null
pkill -9 -f "concurrently" 2>/dev/null

sleep 1

# Verify ports are free
if ! lsof -i:5000 > /dev/null 2>&1 && ! lsof -i:3000 > /dev/null 2>&1; then
  echo "✅ All ports are now free. You can run 'npm start' now."
else
  echo "⚠️  Some processes may still be running. Check with: lsof -i:5000 -i:3000"
fi

