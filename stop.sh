#!/bin/bash

echo "🛑 Stopping TradeAdvisor Development Servers..."

# Stop Backend (uvicorn and python processes)
echo "🔧 Stopping Backend..."
pkill -f uvicorn
pkill -f python
echo "✅ Backend processes stopped"

# Stop Frontend (Node.js processes on port 3000)
echo "🎨 Stopping Frontend..."
PORT=3000
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "✅ No process found running on port $PORT"
else
    echo "🔍 Found process $PID running on port $PORT"
    kill -9 $PID
    echo "✅ Killed process $PID"
fi

# Stop processes on port 8080
echo "🔧 Stopping processes on port 8080..."
PORT_8080=8080
PID_8080=$(lsof -ti:$PORT_8080)

if [ -z "$PID_8080" ]; then
    echo "✅ No process found running on port $PORT_8080"
else
    echo "🔍 Found process $PID_8080 running on port $PORT_8080"
    kill -9 $PID_8080
    echo "✅ Killed process $PID_8080"
fi

# Also kill any Node.js processes that might be running the frontend
NODE_PIDS=$(pgrep -f "next\|npm\|node.*dev")

if [ -z "$NODE_PIDS" ]; then
    echo "✅ No Node.js development processes found"
else
    echo "🔍 Found Node.js processes: $NODE_PIDS"
    echo "$NODE_PIDS" | xargs kill -9
    echo "✅ Killed all Node.js development processes"
fi

echo "🎉 All TradeAdvisor development servers stopped" 