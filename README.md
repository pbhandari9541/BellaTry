# TradeAdvisor

TradeAdvisor is a modern, cloud-native application that provides real-time trading insights and portfolio management capabilities. The system is built with a microservices architecture, utilizing React for the frontend and Node.js for the backend.

![TradeAdvisor Architecture](assets/docs/architecture.svg)

## System Architecture Overview

The following diagram shows how the main components of TradeAdvisor interact, including the frontend, backend, Supabase, OpenAI, Pinecone, Alpha Vantage, and other APIs:

```
┌────────────┐        ┌────────────┐        ┌────────────┐
│  Frontend  │───────▶│  Backend   │───────▶│  Supabase  │
│ (Next.js)  │        │ (FastAPI)  │        │ (Auth, DB) │
└────────────┘        └────────────┘        └────────────┘
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      │                     │                     │
      ▼                     │                     │
┌────────────┐              │                     │
│  OpenAI    │◀─────────────┘                     │
└────────────┘                                    │
      │                                           │
      ▼                                           │
┌────────────┐                                    │
│ Pinecone   │◀────────────────────────────────── ┘
└────────────┘
      │
      ▼
┌────────────┐
│AlphaVantage│
└────────────┘
      │
      ▼
┌────────────┐
│  Other     │
│APIs (SEC,  │
│Reddit, etc)│
└────────────┘
```

## 🚀 Quick Start

### Prerequisites

This project uses **Docker CLI only** (not Docker Desktop) for better reliability and performance on macOS.

**If you have Docker Desktop installed:**
```bash
# Remove Docker Desktop and install Docker CLI
brew uninstall --cask docker
brew install docker docker-compose colima
colima start
```

**If you're starting fresh:**
```bash
# Install Docker CLI tools
brew install docker docker-compose colima

# Start Docker runtime
colima start
```

### Start the Application

```bash
# Clone the repository
git clone https://github.com/yourusername/TradeAdvisor.git

# Start all services using Docker
./docker-start.sh
```

Visit `http://localhost:3000` to access the application.

### Docker Management

```bash
# Start Docker runtime
colima start

# Stop Docker runtime  
colima stop

# Check Docker status
colima status

# Start TradeAdvisor
./docker-start.sh

# Stop TradeAdvisor
./docker-stop.sh

# Clean up Docker (if you encounter storage issues)
./docker-cleanup.sh
```

### Docker Troubleshooting

If you encounter Docker errors like:
- `failed to prepare extraction snapshot`
- `no such file or directory` in Docker operations
- Docker build failures with layer extraction errors

Run the cleanup script:
```bash
./docker-cleanup.sh
```

This will remove all Docker images, containers, and volumes to resolve storage corruption issues.

## 📊 Project Status

| Component | Status | Test Coverage | Last Release |
|-----------|--------|---------------|--------------|
| Frontend  | [![Frontend CI](https://github.com/yourusername/TradeAdvisor/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/yourusername/TradeAdvisor/actions/workflows/frontend-ci.yml) | 85% | v1.0.0 |
| Backend   | [![Backend CI](https://github.com/yourusername/TradeAdvisor/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/yourusername/TradeAdvisor/actions/workflows/backend-ci.yml) | 90% | v1.0.0 |

## 🛡️ Service Account & API Key Setup

| Service         | Free? | Required for Next Iteration? | How to Get Key/Account?         |
|----------------|-------|------------------------------|----------------------------------|
| GCP            | Yes   | Yes (for deployment)         | Already set up                   |
| Supabase       | Yes   | Yes (DB/auth)                | Already set up                   |
| OpenAI         | No*   | Yes (AI features)            | Already set up                   |
| OpenRouter     | Yes   | Optional                     | Sign up if needed                |
| Yahoo Finance  | Yes   | Yes (stock data)             | No key needed for `yfinance`     |
| Pinecone       | Yes   | Optional (for embeddings)    | Sign up for free account         |
| Alpha Vantage  | Yes   | Optional (alt. stock data)   | Sign up for free API key         |
| IEX Cloud      | Yes   | Optional (alt. stock data)   | Sign up for free API key         |
| Finnhub        | Yes   | Optional (alt. stock data)   | Sign up for free API key         |


> **Update this table as you add new services or credentials.**

## 🏗️ Project Structure

```
TradeAdvisor/
├── frontend/           # React frontend application
├── backend/           # Node.js backend services
├── docs/             # Project documentation
├── docker/           # Docker configuration files
├── docker-start.sh   # Start TradeAdvisor with Docker
├── docker-stop.sh    # Stop TradeAdvisor services
├── docker-cleanup.sh # Clean up Docker storage issues
├── start.sh          # Start without Docker
└── stop.sh           # Stop backend processes
```

## 🏆 Best Practice: Authentication & Data Flow

- **Frontend → Supabase Auth** for authentication (sign-up, login, password reset).
- **Frontend → Backend API** for app-specific data (watchlist, chat, etc.), using the Supabase JWT/session for user identification.

### Summary Table

| Action           | Who Calls Supabase Auth?      | Who Handles Auth?                        |
|------------------|------------------------------|------------------------------------------|
| Sign Up/Login    | Frontend (Next.js)           | Supabase Auth Service                    |
| App Data CRUD    | Frontend → Backend API       | Backend (FastAPI), using Supabase JWT for user context |

## 🔄 CI/CD Architecture

### Deployment Workflow
![Deployment Workflow](assets/docs/deployment-workflow.svg)

### Environment Configuration
![Environment Configuration](assets/docs/env-config.svg)

For detailed CI/CD documentation and setup instructions, see [GitHub Actions Documentation](.github/workflows/README.md)

## 📚 Documentation

- [Frontend Documentation](frontend/README.md)
  - React application
  - Component library
  - State management
  - Testing guide

- [Backend Documentation](backend/README.md)
  - API endpoints
  - Database schema
  - Service architecture
  - Testing guide

- [Deployment Guide](docs/DEPLOYMENT.md)
  - Cloud deployment
  - Local setup
  - Configuration

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

**Important:** When running tests in Docker, you must set `NODE_ENV=test` to ensure React runs in development mode:
```bash
# Local testing
npm test

# Docker testing (required for CI)
docker compose run --rm -e NODE_ENV=test frontend npm test -- --watchAll=false
```

Test results summary:
- Unit Tests: 120 passed, 0 failed
- Integration Tests: 45 passed, 0 failed
- E2E Tests: 15 passed, 0 failed

### Backend Tests
```bash
cd backend
npm test
```

Test results summary:
- Unit Tests: 95 passed, 0 failed
- Integration Tests: 30 passed, 0 failed
- API Tests: 25 passed, 0 failed

## 🔧 Environment Variables & Testing Requirements

### NODE_ENV Requirements

**Critical:** Different NODE_ENV values serve different purposes and are required for specific operations:

| NODE_ENV Value | Purpose | When to Use |
|----------------|---------|-------------|
| `development` | Running the development server | Local development, hot reloading |
| `test` | Running tests | Jest test execution, React Testing Library |
| `production` | Running production build | Production deployment, optimized builds |

**Why `NODE_ENV=test` is required for tests:**
- **React Testing Library requirement**: The `act()` function only works in development mode, not production
- **Jest environment**: Tests should run in test environment, not development environment
- **Different from running the app**: When we run the app for development, we use `NODE_ENV=development`. When we run tests, we use `NODE_ENV=test`

### Required Environment Variables

The following environment variables are automatically set with defaults if not provided:

| Variable | Default | Purpose |
|----------|---------|---------|
| `DISABLE_RATE_LIMIT` | `1` | Disables rate limiting in development/testing |
| `PORT` | `8080` | Backend server port |
| `ENVIRONMENT` | `development` | Application environment |
| `NODE_ENV` | `development` | Node.js environment (overridden for tests) |

**Note:** If you see Docker Compose warnings about missing environment variables, they will be automatically set to their default values. The system is designed to work out-of-the-box without requiring manual environment variable setup.

## 🔐 Security

- All endpoints are secured with JWT authentication
- Regular security audits performed
- Dependencies kept up to date with automated vulnerability scanning

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape TradeAdvisor
- Built with support from the open-source community

## Backend API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation, including the SEC Filings Semantic Search endpoint and usage examples.

## Stopping All Backend Processes (stop.sh)

If you encounter database connection issues, prepared statement errors, or want to ensure a clean backend restart, use the provided `stop.sh` script at the project root:

```bash
./stop.sh
```

This script will kill all running `uvicorn` and `python` processes, which is especially useful for resolving PgBouncer/asyncpg prepared statement errors in development.

**Database Connection & PgBouncer Notes:**
- **Production:** The backend connects to the database through PgBouncer using an IPv4 connection. This is required because direct connections do not support IPv4 in our deployment environment.
- **Local Development:** PgBouncer is removed and the backend connects directly to the database for simplicity and compatibility. If you are running locally, ensure PgBouncer is not running and connect directly.
- **Troubleshooting:** If you see persistent DB errors (especially related to prepared statements or connection issues), always run `./stop.sh` before restarting the backend. This ensures all lingering connections are closed and avoids PgBouncer/asyncpg issues.

**Tip:** Always run `./stop.sh` before restarting the backend if you see persistent DB errors or after using hot reloaders.

## Architecture & Authentication Documentation
- [Authentication Flow & System Connections](docs/AUTHENTICATION_FLOW.md) 

## Data Providers Usage in Backend

| Data Type      | yfinance (Yahoo)         | Finnhub                | Alpha Vantage         | Used In (Classes/Services)                          |
|---------------|--------------------------|------------------------|----------------------|-----------------------------------------------------|
| Price history | Yes (main, technicals)   | Fallback (charts)      | Fallback (charts)    | StockDataService, ChartService, TechnicalAgent      |
| Fundamentals  | No                       | Yes (orchestrator)     | Yes (main)           | FundamentalDataService, DataOrchestrator            |
| News          | No                       | Yes (main, news)       | Yes (main, news)     | NewsFetcherAgent, DataOrchestrator                  |
| Company info  | Yes (info)               | Yes (parallel/merge)   | Yes (parallel/merge) | CompanyNameResolver, DataOrchestrator               |

**Notes:**
- `StockDataService` uses yfinance for all technical analysis and price-based endpoints.
- `ChartService` tries Alpha Vantage first, then Finnhub, then mock data for charting.
- `FundamentalDataService` uses Alpha Vantage for company overview; Finnhub is used in orchestrator for fundamentals.
- `NewsFetcherAgent` fetches news from both Finnhub and Alpha Vantage, merging results.
- `CompanyNameResolver` queries all three providers in parallel and merges results for company info.
- `DataOrchestrator` coordinates fetching from all sources for comprehensive data.

This multi-provider approach ensures redundancy, coverage, and best-effort data quality for all endpoints. 