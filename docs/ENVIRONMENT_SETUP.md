# Environment Variable Management

This document explains how to set up and manage environment variables for the TradeAdvisor project across different environments.

## Overview

The project uses environment variables to configure:
- **Supabase** authentication and database
- **OpenAI** API for AI features
- **App URLs** for different environments
- **Feature flags** for development/production

## Environment Files Structure

### Local Development
```
frontend/
├── .env.local          # Local development (gitignored)
├── env.example         # Example template
└── src/lib/env.ts      # Environment configuration utility

backend/
└── .env                # Backend environment variables
```

### Production/Deployment
- **GitHub Secrets**: For CI/CD pipelines
- **Cloud Run Environment Variables**: For deployed services
- **Docker Environment Variables**: For containerized deployments

## Required Environment Variables

### Shared Variables (Frontend & Backend)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | ✅ | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | Supabase key (anon for frontend, service role for backend) | ✅ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Frontend Variables (NEXT_PUBLIC_*)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ | `http://localhost:8080` |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | ❌ | `http://localhost:3000` |
| `NEXT_PUBLIC_ENABLE_DEBUG` | Enable debug mode | ❌ | `true` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | ❌ | `false` |

### Backend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key | ✅ | `sk-...` |
| `OPENAI_DEFAULT_MODEL` | Default OpenAI model | ✅ | `gpt-3.5-turbo` |
| `OPENAI_EMBEDDING_MODEL` | Embedding model | ✅ | `text-embedding-ada-002` |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key | ✅ | `ABC123...` |
| `REDDIT_CLIENT_ID` | Reddit API client ID | ✅ | `your_client_id` |
| `REDDIT_CLIENT_SECRET` | Reddit API client secret | ✅ | `your_client_secret` |
| `REDDIT_USER_AGENT` | Reddit user agent | ✅ | `TradeAdvisor/1.0` |
| `REDDIT_USERNAME` | Reddit username | ✅ | `your_username` |
| `REDDIT_PASSWORD` | Reddit password | ✅ | `your_password` |

## Setup Instructions

### 1. Local Development Setup

#### Frontend
```bash
cd frontend

# Copy the example file
cp env.example .env.local

# Edit .env.local with your actual values
nano .env.local
```

#### Backend
```bash
cd backend

# Create .env file
touch .env

# Add your environment variables
echo "SUPABASE_URL=your_supabase_url" >> .env
echo "SUPABASE_KEY=your_supabase_key" >> .env
# ... add other variables
```

### 2. GitHub Secrets Setup

For CI/CD deployment, add these secrets in your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

#### Shared Secrets
- `SUPABASE_URL`
- `SUPABASE_KEY`

#### Frontend Secrets
- `NEXT_PUBLIC_API_URL`
- `STAGING_API_URL`
- `PRODUCTION_API_URL`
- `STAGING_APP_URL`
- `PRODUCTION_APP_URL`

#### Backend Secrets
- `OPENAI_API_KEY`
- `OPENAI_DEFAULT_MODEL`
- `OPENAI_EMBEDDING_MODEL`
- `ALPHA_VANTAGE_API_KEY`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_USER_AGENT`
- `REDDIT_USERNAME`
- `REDDIT_PASSWORD`

#### GCP Secrets
- `WIF_PROVIDER`
- `WIF_SERVICE_ACCOUNT`
- `GCP_PROJECT_ID`

### 3. Cloud Run Environment Variables

The deployment workflow automatically sets environment variables for Cloud Run services:

#### Backend Service
```bash
gcloud run deploy tradeadvisor-backend \
  --set-env-vars="ENVIRONMENT=production,SUPABASE_URL=...,OPENAI_API_KEY=..."
```

#### Frontend Service
```bash
gcloud run deploy tradeadvisor-frontend \
  --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_API_URL=...,SUPABASE_URL=...,SUPABASE_KEY=..."
```

## Environment-Specific Configurations

### Development
```bash
# frontend/.env.local
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_KEY=your_dev_key
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# backend/.env
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_KEY=your_dev_service_role_key
OPENAI_API_KEY=your_openai_key
# ... other backend variables
```

### Staging
```bash
# GitHub Secrets
STAGING_API_URL=https://staging-backend-url
STAGING_APP_URL=https://staging-frontend-url
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Production
```bash
# GitHub Secrets
PRODUCTION_API_URL=https://production-backend-url
PRODUCTION_APP_URL=https://production-frontend-url
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Validation and Error Handling

### Frontend Validation
The frontend includes automatic environment variable validation:

```typescript
// src/lib/env.ts
export function validateEnv() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file or deployment configuration.'
    );
  }
}
```

### Backend Validation
The backend validates environment variables on startup:

```python
# app/config/supabase.py
def validate_supabase_config():
    if not SUPABASE_URL:
        raise ValueError("SUPABASE_URL is required")
    if not SUPABASE_KEY:
        raise ValueError("SUPABASE_KEY is required")
```

## Troubleshooting

### Common Issues

1. **"supabaseUrl is required"**
   - Check if `SUPABASE_URL` is set in `.env.local`
   - Verify the variable name (case-sensitive)

2. **"React is not defined"**
   - Add `import React from 'react';` to your component files
   - This is required for JSX in Next.js

3. **Environment variables not loading**
   - Restart your development server after adding `.env.local`
   - Check that variable names are correct

4. **Deployment failures**
   - Verify all required secrets are set in GitHub
   - Check Cloud Run environment variables are properly configured

### Debug Mode

Enable debug mode to see environment configuration:

```bash
# .env.local
NEXT_PUBLIC_ENABLE_DEBUG=true
```

This will log environment variable status to the console in development.

## Security Best Practices

1. **Never commit `.env.local` files**
   - They are automatically gitignored
   - Use `env.example` for templates

2. **Use different keys for different environments**
   - Development: Use development Supabase project
   - Staging: Use staging Supabase project
   - Production: Use production Supabase project

3. **Use appropriate key types**
   - Frontend: Use Supabase anonymous key
   - Backend: Use Supabase service role key

4. **Rotate API keys regularly**
   - Set up key rotation schedules
   - Monitor API usage for anomalies

## Migration Guide

### From Old Configuration
If you're migrating from an older setup:

1. **Update variable names**
   - Old: `NEXT_PUBLIC_SUPABASE_URL` → New: `SUPABASE_URL`
   - Old: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → New: `SUPABASE_KEY`

2. **Add missing variables**
   - Check `env.example` for required variables
   - Add any missing variables to your environment

3. **Update deployment scripts**
   - Ensure GitHub Actions use correct secret names
   - Update Cloud Run environment variable names

## Support

For issues with environment setup:
1. Check this documentation
2. Review the `env.example` file
3. Check GitHub Actions logs for deployment issues
4. Verify Cloud Run environment variables in GCP Console 