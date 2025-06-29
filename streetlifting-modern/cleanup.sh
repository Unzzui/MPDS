#!/bin/bash

echo "🧹 Cleaning up MPDS Streetlifting processes..."

# Kill all related processes
echo "   Killing uvicorn processes..."
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "main:app" 2>/dev/null || true

echo "   Killing vite processes..."
pkill -f "vite" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true

echo "   Killing any remaining processes on ports 8000 and 5173..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "✅ All processes cleaned up!"

# Check if ports are free
echo ""
echo "📊 Port status:"
if lsof -ti:8000 >/dev/null 2>&1; then
    echo "   Port 8000: ❌ Still in use"
else
    echo "   Port 8000: ✅ Free"
fi

if lsof -ti:5173 >/dev/null 2>&1; then
    echo "   Port 5173: ❌ Still in use"
else
    echo "   Port 5173: ✅ Free"
fi 