#!/bin/bash

# Environment variables
export PORT=${PORT:-8080}
export ENVIRONMENT=${ENVIRONMENT:-development}
export NODE_ENV=development  # Use development for local runs

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use!"
        exit 1
    fi
}

# Check if required ports are available
check_port $PORT
check_port 3000

# Clean up previous builds
cleanup_frontend() {
    echo "Cleaning up frontend build..."
    rm -rf frontend/.next
    rm -rf frontend/node_modules/.cache
}

# Run backend tests
cd backend

# Load environment variables from root .env file if it exists
if [ -f "../.env" ]; then
    echo "Loading environment variables from root .env file..."
    export $(grep -v '^#' ../.env | xargs)
elif [ -f ".env" ]; then
    echo "Loading environment variables from backend/.env file..."
    export $(grep -v '^#' .env | xargs)
else
    echo "Warning: No .env file found in root or backend directory"
    echo "Please run 'scripts/setup-env.sh' to create environment templates"
    echo "Or create a .env file with required environment variables"
fi

# If venv exists and we're not in Docker, activate it
if [ -d "venv" ] && [ -z "$DOCKER_ENV" ]; then
  source venv/bin/activate
  # Install requirements if needed
  pip install -r requirements.txt
fi

# Disable rate limiting for tests
export DISABLE_RATE_LIMIT=1

# Check if required environment variables are available for tests
if [ -n "$OPENAI_API_KEY" ] && [ -n "$ALPHA_VANTAGE_API_KEY" ]; then
    echo "Running backend tests..."
    python -m pytest
    if [ $? -ne 0 ]; then
      echo "Backend tests failed!"
      exit 1
    fi
else
    echo "Skipping backend tests - missing required API keys (OPENAI_API_KEY, ALPHA_VANTAGE_API_KEY)"
    echo "To run tests, add these keys to backend/.env file"
fi

# Run frontend type checking and tests
cd ../frontend
echo "Running type checking..."
./node_modules/typescript/bin/tsc --noEmit
if [ $? -ne 0 ]; then
  echo "Type checking failed!"
  exit 1
fi

echo "Running tests..."
NODE_ENV=test npm test -- --watchAll=false
if [ $? -ne 0 ]; then
  echo "Frontend tests failed!"
  exit 1
fi

# Clean up and rebuild frontend
cleanup_frontend

# Start the FastAPI backend
cd ../backend
echo "Starting backend on port $PORT..."
if [ -d "venv" ] && [ -z "$DOCKER_ENV" ]; then
  source venv/bin/activate
fi
# Print environment variables for debugging (without values)
echo "Checking Supabase environment variables..."
env | grep -i supabase | cut -d= -f1
uvicorn app.main:app --host 0.0.0.0 --port $PORT --reload &
BACKEND_PID=$!

# Start the Next.js frontend
cd ../frontend
echo "Building frontend in development mode..."
NODE_ENV=development PORT=3000 npm run dev &
FRONTEND_PID=$!

# Function to cleanup processes
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Setup cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

# Exit with status of process that exited first
exit $?

REQUIRED_VARS=(
  ENVIRONMENT
  NEXT_PUBLIC_APP_URL
  CORS_ORIGINS
  SUPABASE_URL
  SUPABASE_KEY
  SUPABASE_PASSWORD
  SUPABASE_DB_URL
  OPENAI_API_KEY
  OPENAI_DEFAULT_MODEL
  OPENAI_EMBEDDING_MODEL
  PINECONE_API_KEY
  PINECONE_ENVIRONMENT
  PINECONE_INDEX
  ALPHA_VANTAGE_API_KEY
  SEC_EDGAR_DOWNLOADER_USER_AGENT
  SEC_CONTACT_EMAIL
  REDDIT_CLIENT_ID
  REDDIT_CLIENT_SECRET
  REDDIT_USER_AGENT
  REDDIT_USERNAME
  REDDIT_PASSWORD
  DISABLE_RATE_LIMIT
  SUPABASE_JWT_SECRET
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set."
    MISSING=1
  fi
done

if [ "$MISSING" = "1" ]; then
  echo "One or more required environment variables are missing. Exiting."
  exit 1
fi 