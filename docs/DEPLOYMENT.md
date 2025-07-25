# TradeAdvisor Deployment Guide

## Local Development

### Running Without Docker
```bash
# Start the application
./start.sh

# This will:
1. Run backend tests
2. Run frontend type checking and tests
3. Start backend on port 8080
4. Start frontend on port 3000
```

### Running With Docker
```bash
# Start the application
./docker-start.sh

# Stop the application
./docker-stop.sh
```

### Docker Troubleshooting

If you encounter Docker errors like:
- `failed to prepare extraction snapshot`
- `no such file or directory` in Docker operations
- Docker build failures with layer extraction errors

Run the cleanup script first:
```bash
./docker-cleanup.sh
```

This will:
- Remove all Docker images, containers, and volumes
- Clean up corrupted storage layers
- Free up disk space
- Allow for a fresh rebuild

**Note:** The cleanup script requires confirmation and will remove ALL Docker data.

The docker setup uses:
- `docker-compose.dev.yml` for development
- Separate Dockerfiles for frontend and backend
- Health checks to ensure service readiness
- Volume mounts for hot reloading

### Docker Configuration
1. **Backend (Dockerfile.dev)**
   - Base: python:3.11-slim
   - Development dependencies included
   - Hot reload enabled
   - Port 8080 exposed

2. **Frontend (Dockerfile.dev)**
   - Base: node:18-alpine
   - Development dependencies included
   - Hot reload enabled
   - Port 3000 exposed

## Architecture Overview

![TradeAdvisor Architecture](../assets/docs/architecture.svg)

### Authentication Architecture

1. **User Authentication**
   - Frontend authenticates users via Identity Provider
   - JWT tokens used for session management
   - Secure token storage in browser
   - Token refresh mechanism implemented

2. **Service Authentication**
   - Workload Identity Federation for GitHub Actions
   - IAM roles for service-to-service auth
   - Secret Manager for sensitive data
   - Environment-specific configurations

3. **Security Layers**
   - HTTPS enforced for all communications
   - JWT validation on backend
   - Rate limiting implemented
   - CORS properly configured

## Cloud Deployment Architecture

### Prerequisites

1. **Google Cloud Platform Setup**
   - GCP Project created
   - Required APIs enabled:
     - Cloud Run
     - Container Registry
     - Cloud Build
     - Cloud Logging

2. **Service Account Configuration**
   ```bash
   # List service accounts
   gcloud iam service-accounts list
   
   # Required roles:
   - Cloud Run Admin
   - Cloud Build Editor
   - Container Registry Service Agent
   - Storage Admin (for artifacts)
   ```

3. **GitHub Repository Secrets**
   - `GCP_PROJECT_ID`: Your GCP project ID
   - `WIF_PROVIDER`: Workload Identity Federation provider
   - `WIF_SERVICE_ACCOUNT`: Service account email

### Deployment Process

1. **GitHub Actions Workflow**
   - Triggered on push to master
   - Uses Workload Identity Federation for authentication
   - Builds and deploys both frontend and backend
   - Automatically configures service URLs

2. **Environment Configuration**
   - Environment variables managed through Cloud Run
   - Backend URL automatically detected and configured
   - PORT handled automatically by Cloud Run

3. **Logging and Monitoring**
   - Build logs stored in Cloud Logging
   - Access through:
     ```bash
     # View build logs
     gcloud logging read "resource.type=cloud_build"
     
     # View service logs
     gcloud logging read "resource.type=cloud_run_revision"
     ```

### Security Measures

1. **Network Security**
   - HTTPS enforced
   - IAM permissions properly scoped
   - Service-to-service authentication

2. **Data Security**
   - Secrets managed in Secret Manager
   - Environment separation
   - Audit logging enabled

## Local Development Details

### Without Docker
- Direct host machine execution
- Real-time code updates
- Easy debugging
- Access via:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:8080

### With Docker
- Isolated environments
- Consistent development experience
- Health checks ensure service readiness
- Access via:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:8080
  - Health check: http://localhost:8080/api/health

## Maintenance

1. **Health Monitoring**
   - Endpoint monitoring
   - Error tracking
   - Performance metrics

2. **Updates and Maintenance**
   - Regular dependency updates
   - Security patches
   - Performance optimization

## Rollback Procedures

1. **Cloud Run Rollback**
   ```bash
   # List revisions
   gcloud run revisions list --service=tradeadvisor-backend
   
   # Rollback to specific revision
   gcloud run services update-traffic tradeadvisor-backend --to-revision=REVISION_NAME
   ```

2. **Local Rollback**
   - Stop services (docker-stop.sh)
   - Checkout previous version
   - Restart services (docker-start.sh)

## Deployment Architecture

### Frontend (Next.js)
- Deployed to Cloud Run
- Containerized using multi-stage Dockerfile
- Environment variables managed through Cloud Run
- Custom domain configured through Cloud Run

### Backend (FastAPI)
- Deployed to Cloud Run
- Containerized using multi-stage Dockerfile
- Connected to Cloud SQL (PostgreSQL)
- Environment variables managed through Cloud Run

### Database
- PostgreSQL on Cloud SQL
- Automated backups enabled
- Private IP configuration

## Deployment Process

1. **Code Push to Master**
   - Triggers GitHub Actions workflow
   - Runs tests and builds
   - Creates Docker images
   - Pushes to Container Registry
   - Deploys to Cloud Run

2. **Environment Configuration**
   - Production environment variables set in Cloud Run
   - Database connection strings managed securely
   - API keys and secrets stored in Secret Manager

3. **Database Migration**
   - Alembic migrations run automatically
   - Backup created before migration
   - Rollback plan in place

4. **Monitoring & Logging**
   - Cloud Monitoring enabled
   - Error reporting configured
   - Performance metrics tracked
   - Log analysis set up

## Rollback Procedure

1. **Immediate Rollback**
   - Revert to previous Cloud Run revision
   - Verify database state
   - Check logs for errors

2. **Database Rollback**
   - Use latest backup if needed
   - Run down migrations
   - Verify data integrity

## Security Measures

1. **Network Security**
   - Cloud Run with HTTPS only
   - IAM permissions properly scoped
   - VPC-SC configured (if needed)
   - DDoS protection enabled

2. **Data Security**
   - Secrets managed in Secret Manager
   - Database encryption enabled
   - Regular security scanning
   - Audit logging enabled

## Monitoring & Maintenance

1. **Health Checks**
   - Endpoint monitoring
   - Database performance
   - Error rate tracking
   - Response time monitoring

2. **Regular Maintenance**
   - Database optimization
   - Log rotation
   - Security updates
   - Performance optimization

## Cost Management

1. **Resource Optimization**
   - Auto-scaling configuration
   - Instance size optimization
   - Cold start management
   - Cache strategy implementation

2. **Cost Monitoring**
   - Budget alerts set up
   - Resource usage tracking
   - Optimization recommendations
   - Regular cost reviews

## Environment Configuration

### Supabase Configuration

1. **Local Development Setup**
   ```bash
   # Add to backend/.env
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_anon_key   # Use anon key for local development
   ```

   ```bash
   # Add to docker-compose.dev.yml environment section
   environment:
     - SUPABASE_URL=${SUPABASE_URL}
     - SUPABASE_KEY=${SUPABASE_KEY}
   ```

2. **Cloud Deployment Setup**
   ```bash
   # Add these secrets in GitHub repository:
   # Settings -> Secrets and variables -> Actions -> New repository secret
   
   # For development environment
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_anon_key
   
   # For production environment (use service role key)
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_service_role_key
   ```

   The GitHub Actions workflow automatically uses these secrets during deployment:
   ```yaml
   gcloud run deploy tradeadvisor-backend \
     --set-env-vars="SUPABASE_URL=${{ secrets.SUPABASE_URL }}" \
     --set-env-vars="SUPABASE_KEY=${{ secrets.SUPABASE_KEY }}"
   ```

3. **Environment-Specific Keys**
   - Development: Use Supabase anon key (limited permissions)
   - Production: Use Supabase service_role key (full access)
   - Different GitHub environments can have different secret values

4. **Verifying Configuration**
   ```bash
   # Local verification
   curl http://localhost:8080/health  # Should show Supabase connection status

   # Cloud Run verification
   curl https://your-cloud-run-url/health
   ```

## Alpha Vantage API Key Setup

Parent: See PLANNING.md Iteration 4: Alpha Vantage Integration

To enable fundamental data features, you must set the `ALPHA_VANTAGE_API_KEY` environment variable:

- **Local development:**
  - Add `ALPHA_VANTAGE_API_KEY=your_real_key_here` to your `.env` file in the backend directory.
- **CI/CD (GitHub Actions):**
  - Add `ALPHA_VANTAGE_API_KEY` as a secret in your GitHub repository (Settings → Secrets and variables → Actions).
  - The CI and deploy workflows will automatically use this secret for tests and deployment.
- **Production (Cloud Run or other):**
  - The deploy workflow passes the key as an environment variable to your backend service.

**Do not commit your real API key to git. Always use environment variables or secrets.** 