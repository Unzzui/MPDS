#!/bin/bash

echo "🚀 Starting MPDS Streetlifting App..."

# Check if we're in the right directory
if [ ! -f "run.sh" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to get local IP address
get_local_ip() {
    if command -v ipconfig &> /dev/null; then
        # Windows
        ipconfig | grep -A 5 "Ethernet adapter" | grep "IPv4" | head -1 | awk '{print $NF}'
    else
        # macOS/Linux
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
    fi
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all servers and cleaning up..."
    
    # Kill specific PIDs if they exist
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
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
    
    echo "✅ All servers stopped and processes cleaned up"
    exit 0
}

# Set up signal handlers for various exit scenarios
trap cleanup SIGINT SIGTERM EXIT

# Kill existing processes on ports 8000 and 5173
echo "🔄 Stopping existing processes..."
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Backend setup
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📥 Installing backend dependencies..."
pip install -r requirements.txt

# Create admin user
echo "👤 Creating admin user..."
python create_admin.py

# Start backend server
echo "🚀 Starting backend server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! check_port 8000; then
    echo "❌ Backend failed to start"
    cleanup
    exit 1
fi

echo "✅ Backend is running on http://localhost:8000"

# Frontend setup
echo "🔧 Setting up frontend..."
cd ../frontend

# Install dependencies
echo "📥 Installing frontend dependencies..."
npm install

# Generate PWA icons
echo "🎨 Generating PWA icons..."
npm run generate-icons

# Start frontend server
echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

# Check if frontend is running
if ! check_port 5173; then
    echo "❌ Frontend failed to start"
    cleanup
    exit 1
fi

# Get local IP address
LOCAL_IP=$(get_local_ip)

echo ""
echo "🎉 MPDS Streetlifting App is running!"
echo ""
echo "📱 Local Access:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo ""
echo "🌐 Network Access (for mobile testing):"
echo "   Frontend: http://$LOCAL_IP:5173"
echo "   Backend:  http://$LOCAL_IP:8000"
echo ""
echo "📋 Demo Credentials:"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "📱 PWA Features:"
echo "   - Install on mobile: Visit http://$LOCAL_IP:5173 on your phone"
echo "   - Add to home screen when prompted"
echo "   - Works offline after first load"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"

# Wait for user to stop
wait