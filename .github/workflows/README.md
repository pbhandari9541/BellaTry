# GitHub Actions Workflows Documentation

## Current Workflow Architecture

### CI/CD Pipeline Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Push/PR       │───▶│   CI (ci.yml)   │───▶│ Deploy (deploy.yml) │
│                 │    │                 │    │                 │
│ - main/master   │    │ - Docker tests  │    │ - GCP Cloud Run │
│ - develop       │    │ - Build verify  │    │ - Both services │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Test Results   │
                    │                 │
                    │ ✅ Pass → Deploy │
                    │ ❌ Fail → Stop   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   GCP Deploy    │
                    │                 │
                    │ 🔐 Auth         │
                    │ 🏗️ Build Images │
                    │ 🚀 Deploy       │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Production    │
                    │                 │
                    │ 🌐 Backend URL  │
                    │ 🌐 Frontend URL │
                    └─────────────────┘
```

*Detailed workflow showing the complete Docker-based CI/CD pipeline from code push to deployment*

### Architecture Components

#### 🔄 **CI Phase (ci.yml)**
- **Docker-Based Testing**: All tests run in the same containers as local development
- **Parallel Execution**: Backend and frontend tests run simultaneously
- **Build Verification**: Ensures Docker images can be built successfully
- **Environment Consistency**: Same containerized environment across local and CI

#### 🚀 **Deploy Phase (deploy.yml)**
- **GCP Authentication**: Secure authentication using Workload Identity Federation
- **Container Registry**: Images built and pushed to Google Container Registry
- **Cloud Run Deployment**: Serverless deployment with automatic scaling
- **Environment Configuration**: Dynamic backend URL configuration for frontend

#### 🛡️ **Security & Reliability**
- **No Secrets in Code**: All sensitive data stored in GitHub Secrets
- **Immutable Deployments**: Each deployment uses unique image tags
- **Health Checks**: Automatic health monitoring and rollback capabilities
- **Environment Isolation**: Separate configurations for different environments

### Key Benefits

✅ **Consistency**: Same Docker environment everywhere  
✅ **Reliability**: No "works on my machine" issues  
✅ **Speed**: Parallel testing and optimized builds  
✅ **Security**: Secure authentication and secret management  
✅ **Scalability**: Easy to add more services  
✅ **Maintainability**: Single source of truth for deployment  

### Deployment Flow
![Deployment Workflow](../../assets/docs/deployment-workflow.svg)

### Environment Variables
![Environment Configuration](../../assets/docs/env-config.svg)

## Current Setup

### Workflow Files
- **`ci.yml`**: Main CI workflow that runs tests using Docker containers
- **`deploy.yml`**: Main deployment workflow that builds and deploys both services to GCP Cloud Run

### Docker-Based CI/CD
Our CI/CD pipeline uses Docker containers for consistency between local development and CI environments:

1. **CI Testing**: Uses `docker-compose.dev.yml` to run tests in the same containers as local development
2. **Deployment**: Uses production Dockerfiles to build and deploy to GCP Cloud Run
3. **Environment Consistency**: Same containerized environment across all stages

### Service Account & Authentication
- **Workload Identity Federation**: Securely authenticates GitHub Actions with GCP
- **Service Account**: `github-actions@aerobic-acronym-452521-j6.iam.gserviceaccount.com`
- **Region**: `us-central1`

## CI Workflow Details

### Test Phase
The CI workflow (`ci.yml`) performs the following steps:

1. **Backend Tests**: Runs `python -m pytest` in the backend Docker container
2. **Frontend Type Check**: Runs `npm run type-check` in the frontend Docker container  
3. **Frontend Tests**: Runs `npm test` in the frontend Docker container
4. **Build Verification**: Ensures both Docker images build successfully

### Deployment Phase
The deployment workflow (`deploy.yml`) performs the following steps:

1. **Authenticate to GCP**: Uses Workload Identity Federation
2. **Build Backend Image**: Uses `backend/cloudbuild.yaml` to build and push to Container Registry
3. **Build Frontend Image**: Uses `frontend/cloudbuild.yaml` to build and push to Container Registry
4. **Deploy Backend**: Deploys to Cloud Run with environment variables
5. **Deploy Frontend**: Deploys to Cloud Run with backend URL automatically configured

## Best Practices for New Projects

### Creating New Service Account
1. Create a new service account in GCP:
   ```bash
   gcloud iam service-accounts create NEW_SA_NAME \
     --description="GitHub Actions service account for PROJECT_NAME" \
     --display-name="GitHub Actions PROJECT_NAME"
   ```

2. Grant necessary permissions:
   ```bash
   # Cloud Run access
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:NEW_SA_NAME@PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   # Cloud Build access
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:NEW_SA_NAME@PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/cloudbuild.builds.builder"
   
   # Artifact Registry access
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:NEW_SA_NAME@PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/artifactregistry.admin"
   ```

3. Configure Workload Identity Federation:
   ```bash
   # Create a new Workload Identity Pool (if needed)
   gcloud iam workload-identity-pools create "github-actions-pool" \
     --location="global" \
     --display-name="GitHub Actions Pool"

   # Create Workload Identity Provider
   gcloud iam workload-identity-pools providers create-oidc "github-provider" \
     --location="global" \
     --workload-identity-pool="github-actions-pool" \
     --display-name="GitHub provider" \
     --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
     --issuer-uri="https://token.actions.githubusercontent.com"
   ```

### Reusing Workflows

While service accounts should be separate, workflows can be reused. Create reusable workflows:

```yaml
# .github/workflows/reusable-deploy.yml
name: Reusable Deploy
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      WIF_PROVIDER:
        required: true
      WIF_SERVICE_ACCOUNT:
        required: true
      GCP_PROJECT_ID:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # Your deployment steps here
```

Usage in new project:
```yaml
# New project's workflow
name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: production
    secrets:
      WIF_PROVIDER: ${{ secrets.WIF_PROVIDER }}
      WIF_SERVICE_ACCOUNT: ${{ secrets.NEW_PROJECT_SA }}
      GCP_PROJECT_ID: ${{ secrets.NEW_PROJECT_ID }}
```

## Security Considerations

1. **Separate Service Accounts**: Create distinct service accounts for each project
2. **Minimal Permissions**: Grant only required permissions
3. **Environment Separation**: Use different service accounts for dev/staging/prod
4. **Secret Management**: Store sensitive data in GitHub Secrets
5. **Regular Audits**: Review permissions and access regularly

## Current Deployment URLs

- Backend: https://tradeadvisor-backend-499526964042.us-central1.run.app
- Frontend: https://tradeadvisor-frontend-499526964042.us-central1.run.app

## Troubleshooting

1. **Authentication Issues**:
   - Verify Workload Identity configuration
   - Check service account permissions
   - Ensure secrets are properly set in GitHub

2. **Deployment Failures**:
   - Check Cloud Build logs
   - Verify environment variables
   - Ensure service account has necessary permissions

3. **Environment Variables**:
   - Backend URL is dynamically fetched during deployment
   - Supabase credentials must be set in GitHub Secrets

## Diagram Generation

The workflow diagrams are maintained in this document using Mermaid syntax. To update the SVG files used in the main README:

1. Make changes to the Mermaid diagrams in this document
2. Run the diagram generation script:
   ```bash
   ./scripts/generate-diagrams.sh
   ```
3. Commit both the updated documentation and generated SVGs

This ensures that the diagrams are consistent across all documentation 

## Environment Variables: Best Practices (2024+)

- **Backend:** Use `SUPABASE_URL`, `SUPABASE_KEY`, and other secrets as runtime environment variables (set in Cloud Run and GitHub Secrets).
- **Frontend:** Use `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`, and other `NEXT_PUBLIC_*` variables. These must be set as build args in CI/CD and as runtime env vars in Cloud Run if SSR/server code needs them.
- **Never mix:** Do not use `SUPABASE_URL` in frontend code or `NEXT_PUBLIC_SUPABASE_URL` in backend code.
- **SUPABASE_JWT_SECRET**: Required for backend authentication. Must be set in GitHub Secrets and passed to all backend jobs, Docker Compose, and Cloud Run deployments.

### Adding a New Environment Variable: Checklist

When you add a new environment variable, follow these steps:

#### For **Frontend** (`NEXT_PUBLIC_*`):
1. **Add to GitHub Secrets:**
   - Go to GitHub → Settings → Secrets and variables → Actions
   - Add the new variable (e.g., `NEXT_PUBLIC_MY_FEATURE_FLAG`)
2. **Update `.github/workflows/ci.yml`**
   - Add the new secret to the `secrets:` block for the deploy job
   - Pass it as a build arg in the frontend Docker build step (if needed)
3. **Update `.github/workflows/deploy.yml`**
   - Add the new secret to the `workflow_call.secrets` block
   - Pass it as a substitution in the Cloud Build step (if needed)
   - Add it to the `--set-env-vars` for Cloud Run deploy (if SSR/server code needs it)
4. **Update `frontend/cloudbuild.yaml` and `frontend/Dockerfile`**
   - Add as a build arg and `ENV` if needed
5. **Update documentation**
   - Document the new variable in `docs/ENVIRONMENT_SETUP.md` and/or this file

#### For **Backend** (e.g., `SUPABASE_URL`, `SUPABASE_KEY`, etc.):
1. **Add to GitHub Secrets:**
   - Go to GitHub → Settings → Secrets and variables → Actions
   - Add the new variable (e.g., `MY_BACKEND_SECRET`)
2. **Update `.github/workflows/ci.yml`**
   - Add the new secret to the `secrets:` block for the deploy job
   - Add to the `env:` block for backend tests if needed
3. **Update `.github/workflows/deploy.yml`**
   - Add the new secret to the `workflow_call.secrets` block
   - Add it to the `--set-env-vars` for the backend Cloud Run deploy step
4. **Update backend code/config**
   - Reference the new variable in your backend code/config as needed
5. **Update documentation**
   - Document the new variable in `docs/ENVIRONMENT_SETUP.md` and/or this file

**See also:** [docs/ENVIRONMENT_SETUP.md](../../docs/ENVIRONMENT_SETUP.md) 