#!/bin/bash

# TradeAdvisor Environment Setup Script
# This script helps set up environment variables for local development

set -e

echo "🔧 TradeAdvisor Environment Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the project root
if [ ! -f "PLANNING.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Setting up environment variables for local development..."

# Frontend setup
print_status "Setting up frontend environment..."

if [ ! -f "frontend/.env.local" ]; then
    if [ -f "frontend/env.example" ]; then
        cp frontend/env.example frontend/.env.local
        print_success "Created frontend/.env.local from template"
    else
        print_warning "frontend/env.example not found, creating basic .env.local"
        cat > frontend/.env.local << EOF
# Supabase Configuration (same as backend)
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_KEY=your_supabase_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
EOF
    fi
else
    print_warning "frontend/.env.local already exists, skipping..."
fi

# Backend setup
print_status "Setting up backend environment..."

if [ ! -f "backend/.env" ]; then
    print_warning "backend/.env not found, creating template..."
    cat > backend/.env << EOF
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002

# Alpha Vantage Configuration
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

# Reddit Configuration
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
REDDIT_USER_AGENT=TradeAdvisor/1.0
REDDIT_USERNAME=your_reddit_username_here
REDDIT_PASSWORD=your_reddit_password_here

# Environment
ENVIRONMENT=development
EOF
    print_success "Created backend/.env template"
else
    print_warning "backend/.env already exists, skipping..."
fi

# Validate environment files
print_status "Validating environment files..."

# Check frontend required variables
if [ -f "frontend/.env.local" ]; then
    missing_frontend=()
    
    if ! grep -q "SUPABASE_URL" frontend/.env.local; then
        missing_frontend+=("SUPABASE_URL")
    fi
    
    if ! grep -q "SUPABASE_KEY" frontend/.env.local; then
        missing_frontend+=("SUPABASE_KEY")
    fi
    
    if [ ${#missing_frontend[@]} -eq 0 ]; then
        print_success "Frontend environment variables look good"
    else
        print_warning "Missing frontend variables: ${missing_frontend[*]}"
        print_warning "Please update frontend/.env.local with actual values"
    fi
fi

# Check backend required variables
if [ -f "backend/.env" ]; then
    missing_backend=()
    
    required_backend_vars=(
        "SUPABASE_URL"
        "SUPABASE_KEY"
        "OPENAI_API_KEY"
        "ALPHA_VANTAGE_API_KEY"
        "REDDIT_CLIENT_ID"
        "REDDIT_CLIENT_SECRET"
        "REDDIT_USERNAME"
        "REDDIT_PASSWORD"
    )
    
    for var in "${required_backend_vars[@]}"; do
        if ! grep -q "^${var}=" backend/.env; then
            missing_backend+=("$var")
        fi
    done
    
    if [ ${#missing_backend[@]} -eq 0 ]; then
        print_success "Backend environment variables look good"
    else
        print_warning "Missing backend variables: ${missing_backend[*]}"
        print_warning "Please update backend/.env with actual values"
    fi
fi

echo ""
print_success "Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit frontend/.env.local with your Supabase credentials"
echo "2. Edit backend/.env with your API keys"
echo "3. Run 'npm run dev' in the frontend directory"
echo "4. Run 'python -m uvicorn app.main:app --reload' in the backend directory"
echo ""
echo "📚 For more information, see docs/ENVIRONMENT_SETUP.md"
echo ""
print_warning "Remember: Never commit .env files to version control!" 