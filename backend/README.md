# TradeAdvisor Backend

This is the backend service for the TradeAdvisor project, which provides AI-powered trading recommendations using OpenAI and LangGraph.

## Features

- OpenAI integration with proper error handling and retries
- Conversation state management using LangGraph
- Trading recommendation generation
- RESTful API endpoints (coming soon)
- Authentication and authorization (coming soon)
- Database integration (coming soon)

## How It Works

### Architecture Overview

- **OpenAIService**: Handles all LLM calls (OpenAI or OpenRouter), with retry and rate limiting.
- **LangGraphService**: Manages conversation state and workflow using LangGraph.
- **Config**: All secrets and model settings are loaded from environment variables or `.env` (never hardcoded).
- **Endpoints**: `/ai/chat`, `/ai/conversation`, `/ai/embed` provide LLM-powered API access.
- **CI/CD**: GitHub Actions runs tests and deploys, passing secrets securely.

### Sequence Diagram

![Backend Sequence Diagram](assets/docs/backend-sequence-diagram.svg)

### Key Features

- **Robust error handling**: Retries and rate limits are enforced for all LLM calls.
- **Configurable**: All API keys and model settings are managed via environment variables.
- **Tested**: All core logic and endpoints are covered by automated tests in CI.
- **Extensible**: Easily add new agents or LLM providers by updating config and service logic.

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd TradeAdvisor/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your configuration:
```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_ORG_ID=your_org_id_here  # Optional
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PASSWORD=your_db_password
SUPABASE_DB_URL=
```

## Development

1. Run tests:
```bash
pytest
```

2. Run the development server (coming soon):
```bash
uvicorn app.main:app --reload
```

## Project Structure

```
backend/
├── app/
│   ├── services/
│   │   ├── openai_service.py    # OpenAI integration
│   │   └── langgraph_service.py # Conversation management
│   ├── config/
│   │   └── openai_config.py     # OpenAI configuration
│   └── utils/                   # Utility functions
├── tests/
│   ├── test_openai_service.py
│   └── test_langgraph_service.py
├── requirements.txt
└── README.md
```

## Agent Communication Protocol & Monitoring (LangGraph Agents)

### AgentMessage Protocol
- All agent-to-agent and workflow-to-agent communication uses a structured `AgentMessage` (see `app/agents/protocol.py`).
- **Fields:**
  - `sender` (str): Name of the sending agent or service
  - `recipient` (str): Name of the receiving agent
  - `type` (str): Message type (`info`, `request`, `response`, `error`)
  - `content` (Any): Main message payload (e.g., news, summary, analysis)
  - `metadata` (dict, optional): Additional context (e.g., full state)
- This protocol ensures robust, extensible, and testable agent orchestration.
- See: [PLANNING.md, Phase 3 - Core Agent Logic, Step 4](../PLANNING.md)

### Error Handling & Monitoring
- All agent node methods in `LangGraphService` use robust try/except blocks.
- On success, `MonitoringService.log_success()` is called with a descriptive message.
- On failure, `MonitoringService.log_failure()` is called with the error.
- Monitoring is in-process, zero-cost, and logs to the standard logger.
- You can observe monitoring status by calling `get_monitoring_service().get_status()` in Python, or by reviewing logs.
- This pattern is ready for future extension (e.g., dashboards, alerts) but is lightweight for MVP.
- See: [PLANNING.md, Phase 3 - Core Agent Logic, Step 5](../PLANNING.md)

## API Documentation (Coming Soon)

The API documentation will be available at `/docs` when the server is running.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# SEC Filings Semantic Search API

## `/sec/search` Endpoint

This endpoint provides semantic search over SEC filings and related financial data, leveraging OpenAI embeddings and Pinecone vector search. It is robust, production-ready, and follows best practices for error handling and logging.

### Purpose
- Search SEC filings and financial metadata using natural language queries.
- Returns the most relevant filings and metadata, with rich context.

### Request
- **Method:** `POST`
- **Path:** `/sec/search`
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "query": "Apple",
    "top_k": 5,
    "metadata_filter": null
  }
  ```
  - `query` (string): The search query (required).
  - `top_k` (int): Number of results to return (default: 5).
  - `metadata_filter` (object/null): Optional metadata filter for filings.

### Response
- **Status:** `200 OK`
- **Body:**
  ```json
  {
    "results": [
      {
        "id": "AAPL",
        "score": 0.803968906,
        "metadata": {
          "symbol": "AAPL",
          "shortName": "Apple Inc.",
          "marketCap": 2936079646720.0,
          ...
        }
      },
      ...
    ]
  }
  ```
  - `id` (string): The unique identifier for the filing or entity.
  - `score` (float): Relevance score from Pinecone.
  - `metadata` (object): Rich metadata for the result (e.g., symbol, name, financials).

### Example Usage (curl)
```sh
curl -X POST "http://localhost:8080/sec/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Apple",
    "top_k": 5,
    "metadata_filter": null
  }'
```

### Error Handling
- Returns `400` or `500` with a clear error message if the request is invalid or an internal error occurs.
- Defensive type checks and robust handling of Pinecone client versions.

### Production Logging
- All debug and verbose print statements are removed for production.
- Only essential error logging is retained, minimizing cloud log costs and protecting sensitive data.

---

For more details, see the code in `app/api/endpoints/sec.py` and the planning in `../PLANNING.md`.

# Retrieval-Augmented Generation (RAG) & Querying API

## `/ai/analyze` Endpoint

This endpoint provides advanced stock analysis using a Retrieval-Augmented Generation (RAG) pipeline, combining semantic search (Pinecone) and LLM-based reasoning (LangGraph + OpenAI).

### Purpose
- Analyze one or more stock tickers in response to a user query.
- Uses semantic search to retrieve relevant context, then generates actionable analysis with an LLM.
- Supports batch processing, caching, rate limiting, and API key authentication.

### Request
- **Method:** `POST`
- **Path:** `/ai/analyze`
- **Headers:**
  - `X-API-Key`: Your API key (required)
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "tickers": ["AAPL", "GOOG"],
    "query": "What is the outlook?",
    "user_id": "optional-user-id"
  }
  ```
  - `tickers` (list of str): Stock symbols to analyze (required)
  - `query` (str): Natural language question or analysis request (required)
  - `user_id` (str, optional): For personalization or tracking

### Response
- **Status:** `200 OK`
- **Body:**
  ```json
  {
    "status": "ok",
    "results": {
      "AAPL": {
        "matches": [ ... ],      // Top Pinecone semantic search results
        "rag_answer": "...",     // LLM-generated analysis
        "context": "..."         // (Optional) Context used for answer
      },
      "GOOG": { ... }
    }
  }
  ```

### Features
- **RAG Pipeline:** Combines Pinecone vector search and LangGraph LLM orchestration.
- **Batch Processing:** Analyze multiple tickers in parallel.
- **Caching:** In-memory cache for embeddings, search, and LLM results (swap for Redis in prod).
- **Rate Limiting:** Per-API-key or per-IP, configurable.
- **API Key Auth:** Requires `X-API-Key` header (see below).
- **Extensible:** Modular design for future prompt/agent/DB changes.

### Example Usage (curl)
```sh
curl -X POST "http://localhost:8080/ai/analyze" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key-123" \
  -d '{
    "tickers": ["AAPL", "GOOG"],
    "query": "What is the outlook?"
  }'
```

### Error Handling
- `401 Unauthorized`: Missing or invalid API key.
- `422 Unprocessable Entity`: Invalid request schema.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unexpected errors, with clear messages.

### API Key Management
- For development, use one of the hardcoded keys: `dev-key-123`, `test-key-456`.
- For production, swap to DB/env/file-based key management.

### OpenAPI Docs
- Full schema and usage available at `/docs` when the backend is running.

---

**See also:**  
- [PLANNING.md, Phase 4 - RAG & Querying](../PLANNING.md)  
- Code: `app/api/endpoints/ai.py`, `app/services/langgraph_service.py`, `app/services/pinecone_service.py`, `app/utils/api_key_auth.py`, `app/utils/rate_limiter.py`

---

# Other API Endpoints

## Stock Info API

### `/stock/{ticker}`
- **Method:** GET
- **Purpose:** Get basic stock info for a given ticker symbol (Yahoo Finance integration).
- **Request:**
  - Path parameter: `ticker` (string, required)
- **Response:**
  - JSON object with stock info fields (see `StockInfo` model)
- **Example:**
  ```sh
  curl -X GET "http://localhost:8080/stock/AAPL"
  ```

---

## Fundamental Data API

### `/fundamental/{ticker}`
- **Method:** GET
- **Purpose:** Get company overview (fundamentals) for a given ticker symbol from Alpha Vantage.
- **Request:**
  - Path parameter: `ticker` (string, required)
- **Response:**
  - JSON object with company fundamentals (fields as returned by Alpha Vantage)
- **Example:**
  ```sh
  curl -X GET "http://localhost:8080/fundamental/AAPL"
  ```

---

## Health Check API

### `/api/health`
- **Method:** GET
- **Purpose:** Health check endpoint that monitors system and database status.
- **Response:**
  - JSON object with status, service info, uptime, memory, CPU, and Supabase status.
- **Example:**
  ```sh
  curl -X GET "http://localhost:8080/api/health"
  ```

---

## AI Services API

### `/ai/chat`
- **Method:** POST
- **Purpose:** Create a chat completion using OpenAI.
- **Request:**
  - JSON body: `{ "messages": [ {"role": "user", "content": "..."}, ... ] }`
- **Response:**
  - JSON object: `{ "content": ..., "model": ..., "usage": ... }`
- **Example:**
  ```sh
  curl -X POST "http://localhost:8080/ai/chat" \
    -H "Content-Type: application/json" \
    -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
  ```

### `/ai/embed`
- **Method:** POST
- **Purpose:** Get embeddings for text using OpenAI.
- **Request:**
  - JSON body: `{ "text": "..." }`
- **Response:**
  - JSON object: `{ "success": true, "embedding": [...] }`
- **Example:**
  ```sh
  curl -X POST "http://localhost:8080/ai/embed" \
    -H "Content-Type: application/json" \
    -d '{"text": "Apple Inc."}'
  ```

### `/ai/conversation`
- **Method:** POST
- **Purpose:** Process a user message through the LangGraphService workflow.
- **Request:**
  - JSON body: `{ "message": "..." }`
- **Response:**
  - JSON object with conversation result.
- **Example:**
  ```sh
  curl -X POST "http://localhost:8080/ai/conversation" \
    -H "Content-Type: application/json" \
    -d '{"message": "Tell me about Apple."}'
  ```

---

## Completion API

### `/completion`
- **Method:** POST
- **Purpose:** Create a chat completion using OpenAI (alternative endpoint).
- **Request:**
  - JSON body: `{ "messages": [...], "model": "...", "temperature": ..., "max_tokens": ... }`
- **Response:**
  - JSON object: `{ "content": ..., "model": ..., "usage": ..., "latency": ... }`
- **Example:**
  ```sh
  curl -X POST "http://localhost:8080/completion" \
    -H "Content-Type: application/json" \
    -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
  ```

---

## Embedding API

### `/embedding/{ticker}`
- **Method:** POST
- **Purpose:** Generate and store embedding for a ticker, merging Yahoo and Alpha Vantage data.
- **Request:**
  - Path parameter: `ticker` (string, required)
- **Response:**
  - JSON object with embedding result or error.
- **Example:**
  ```sh
  curl -X POST "http://localhost:8080/embedding/AAPL"
  ```

---

For detailed request/response schemas, see the FastAPI docs at `/docs` or `/redoc` when the backend is running.

# Reddit Integration API

## Overview

The Reddit integration provides endpoints for fetching Reddit posts and comments, performing sentiment analysis, and storing/searching Reddit data in Pinecone for semantic and metadata-based queries. All endpoints include robust error handling, input validation, and logging.

## Setup
- Ensure Reddit API credentials are set in your environment variables or `.env` file:
  - `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`
- The backend uses [PRAW](https://praw.readthedocs.io/) for Reddit API access.

## Endpoints

### `/reddit/posts`
- **Method:** GET
- **Purpose:** Fetches posts from a specified subreddit.
- **Query Parameters:**
  - `subreddit` (string, required): Subreddit name
  - `limit` (int, optional, default 10): Number of posts (1-100)
- **Response:**
  - JSON object with subreddit and list of posts (each with id, title, author, created_utc, score, num_comments, permalink, url, sentiment)
- **Example:**
  ```sh
  curl -X GET "http://localhost:8080/reddit/posts?subreddit=stocks&limit=5"
  ```

### `/reddit/comments`
- **Method:** GET
- **Purpose:** Fetches top-level comments for a given Reddit submission.
- **Query Parameters:**
  - `submission_id` (string, required)
  - `limit` (int, optional, default 10): Number of comments (1-100)
- **Response:**
  - JSON object with submission_id and list of comments (each with id, author, body, score, created_utc, permalink, sentiment)
- **Example:**
  ```sh
  curl -X GET "http://localhost:8080/reddit/comments?submission_id=abc123&limit=5"
  ```

### `/reddit/upsert_posts`
- **Method:** POST
- **Purpose:** Upserts fetched Reddit posts into Pinecone with embeddings and metadata (including sentiment).
- **Body:**
  ```json
  {
    "subreddit": "stocks",
    "limit": 5
  }
  ```
- **Response:**
  - JSON object with upserted count and subreddit
- **Example:**
  ```sh
  curl -X POST "http://localhost:8080/reddit/upsert_posts" -H "Content-Type: application/json" -d '{"subreddit": "stocks", "limit": 5}'
  ```

### `/reddit/search`
- **Method:** POST
- **Purpose:** Semantic and metadata-filtered search over Reddit posts/comments in Pinecone.
- **Body:**
  ```json
  {
    "query": "AI stocks",
    "namespace": "reddit-posts",
    "top_k": 5,
    "metadata_filter": {"sentiment": "positive"}
  }
  ```
- **Response:**
  - JSON object with a list of matches (each with id, score, metadata)
- **Example:**
  ```sh
  curl -X POST "http://localhost:8080/reddit/search" -H "Content-Type: application/json" -d '{"query": "AI stocks", "namespace": "reddit-posts", "top_k": 5, "metadata_filter": {"sentiment": "positive"}}'
  ```

### `/reddit/debug_vectors` and `/reddit/debug_stats`
- **Purpose:** Diagnostic endpoints to inspect stored vectors and Pinecone index stats for Reddit data.
- **Usage:** For debugging and development only.

## Features
- **Sentiment Analysis:** All posts and comments are analyzed for sentiment (positive, negative, neutral) using the OpenAI API.
- **Robust Error Handling:** All endpoints validate input and return clear error messages for invalid or missing parameters.
- **Logging & Monitoring:** Centralized logging and monitoring for all Reddit operations.
- **Vector Store Integration:** Reddit data is embedded and stored in Pinecone, supporting semantic and metadata-based search.
- **Comprehensive Tests:** All endpoints are covered by unit and integration tests, including edge cases and error scenarios.

## See Also
- Implementation: `app/services/reddit_service.py`, `app/api/endpoints/reddit.py`
- Planning: [PLANNING.md](../PLANNING.md) 

# Audit & Document Integration Points

This section summarizes the current integration points and data flow in the TradeAdvisor backend. It provides a high-level overview of how each major data source and service is accessed and how they interact.

## 1. Reddit
- **Service:** `RedditService`
- **Endpoints:** `/reddit/posts`, `/reddit/comments`, `/reddit/upsert_posts`, `/reddit/search`, `/reddit/debug_vectors`, `/reddit/debug_stats`
- **Uses:** PRAW for Reddit API, OpenAI for sentiment/embeddings, Pinecone for vector storage/search
- **Flow:**
  1. API endpoint receives request
  2. `RedditService` fetches data from Reddit
  3. Sentiment analysis via OpenAI
  4. Embedding via OpenAI
  5. Upsert/search in Pinecone
  6. Return results

## 2. SEC Filings
- **Service:** `SecFilingEmbeddingService`
- **Endpoints:** `/sec/search`
- **Uses:** Custom SEC client, OpenAI for embeddings, Pinecone for vector storage/search
- **Flow:**
  1. API endpoint receives request
  2. Service fetches/embeds SEC filings
  3. Upsert/search in Pinecone
  4. Return results

## 3. Yahoo Finance
- **Service:** `StockDataService`
- **Endpoints:** `/stock/{ticker}`
- **Uses:** yfinance for stock data
- **Flow:**
  1. API endpoint receives request
  2. Service fetches stock info
  3. Return results

## 4. Alpha Vantage
- **Service:** `FundamentalDataService`
- **Endpoints:** `/fundamental/{ticker}`
- **Uses:** Alpha Vantage API for fundamentals
- **Flow:**
  1. API endpoint receives request
  2. Service fetches company overview
  3. Return results

## 5. OpenAI
- **Service:** `OpenAIService`
- **Used by:** Reddit, SEC, Stock, and other services
- **Features:** Embeddings, sentiment analysis, chat/completion
- **Flow:**
  1. Service receives text
  2. Calls OpenAI API
  3. Returns embedding/sentiment/completion

## 6. Pinecone
- **Service:** `PineconeService`
- **Used by:** Reddit, SEC, Stock, and other services
- **Features:** Upsert/query vectors, namespace support
- **Flow:**
  1. Service receives vectors/queries
  2. Calls Pinecone API
  3. Returns results

## 7. Supabase
- **Service:** (Planned/Partial)
- **Used for:** User data, authentication, possibly metadata storage

## Integration Diagram

![Backend Integration Diagram](assets/docs/backend-integration-points-and-data-flow.svg)

**See also:**
- [PLANNING.md](../PLANNING.md) for future integration and optimization plans.

## Registering and Using Data Sources

The `DataSourceRegistry` allows you to register and access any data source (Reddit, Stock, Alpha Vantage, SEC, etc.) through a unified interface. This makes it easy for agents, endpoints, or scripts to fetch or search data from any source in a consistent way.

### Example Usage

```python
from app.services.data_source_registry import DataSourceRegistry
from app.services.reddit_service import RedditService
from app.services.core.market_data_engine import MarketDataEngine
from app.services.sec_filing_embedding_service import SecFilingEmbeddingService

# Create the registry
registry = DataSourceRegistry()

# Register data sources
registry.register("reddit", RedditService())
registry.register("stock", MarketDataEngine())
registry.register("sec", SecFilingEmbeddingService())

# Fetch Reddit posts from r/stocks
reddit_posts = registry.get("reddit").fetch("stocks", limit=3)
print("Reddit posts:", reddit_posts)

# Fetch stock info for AAPL
stock_info = registry.get("stock").fetch("AAPL")
print("Stock info:", stock_info)

# Fetch company fundamentals for AAPL (with fallback)
fundamental_info = registry.get("stock").get_fundamentals("AAPL")
print("Fundamental info:", fundamental_info)

# Search SEC filings for 'Apple'
sec_results = registry.get("sec").search("Apple", top_k=3)
print("SEC search results:", sec_results)
```

You can add more sources in the same way. This pattern supports future agentic logic and unified API endpoints. 

## Future Work: Caching, Metrics, and Batch Processing

The current backend uses in-memory caching and basic logging for performance and monitoring. For scalability and production readiness, the following improvements are planned:

### Distributed Caching
- **Planned:** Integrate Redis or another distributed cache to reduce redundant API calls and improve response times across multiple backend instances.
- **Status:** Skipped for now due to cost/complexity. All caching is currently in-memory (per-process).
- **Reference:** See [PLANNING.md](../PLANNING.md) for caching strategy and future work.

### Performance Metrics & Monitoring
- **Planned:** Add performance metrics (e.g., response times, throughput, error rates) and expose them via monitoring endpoints (e.g., Prometheus, custom logging).
- **Status:** Skipped for now. To be added in a future iteration for observability and production monitoring.
- **Reference:** See [PLANNING.md](../PLANNING.md) for metrics and monitoring plans.

### Batch Processing & Load Testing
- **Planned:** Enhance batch upsert/search support for all data sources and add load tests to validate performance targets under real-world usage.
- **Status:** Not implemented yet. To be prioritized in future optimization iterations.
- **Reference:** See [PLANNING.md](../PLANNING.md) for batch processing and load testing plans.

---

These improvements will be addressed in future iterations as the system scales and production requirements increase.

## Agent Rate Limiting and Caching

- Agent `analyze` methods are rate-limited by default (5s between calls per agent instance) using an in-memory decorator.
- **Test/CI override:** Set `DISABLE_RATE_LIMIT=1` in the environment to disable rate limiting for tests or rapid workflows.
- See `app/utils/caching_utils.py` for implementation details. 

## Agent Retry and Fallback Logic

- All agent `analyze` methods now use an async retry decorator (`@async_retry`) to automatically retry on transient errors (up to 3 attempts, with exponential backoff).
- If all retries fail, each agent returns a default fallback response (e.g., empty list, default string, or neutral result) and logs the fallback event.
- This pattern increases robustness and prevents workflow failures due to temporary issues.
- See `app/utils/caching_utils.py` for the retry decorator and agent files for fallback logic.
- **Note:** This is MVP logic. More sophisticated error handling and distributed retry/fallback strategies will be added in future iterations as the system scales. 

## Agent Memory Management

- All agents support memory management via `add_to_memory`, `get_memory`, and `clear_memory` methods (inherited from `BaseAgent`).
- Memory is stored in a simple in-memory list for MVP (conversation history, context, or analysis results).
- See `app/agents/base_agent.py` and PLANNING.md, Phase 3 - Core Agent Logic, Step 7 for details.
- **Note:** This is MVP logic. Persistent, distributed, or context-window memory will be added in future iterations as needed.

## Environment Variables

The backend requires the following environment variables for database connectivity:

- `SUPABASE_URL`: Your Supabase project URL (e.g., https://<project-ref>.supabase.co)
- `SUPABASE_PASSWORD`: The password for the Supabase Postgres database (find this in your Supabase dashboard under Database settings)
- `SUPABASE_DB_URL` (optional): If you want to override and provide a direct Postgres connection string, set this instead of `SUPABASE_URL`/`SUPABASE_PASSWORD`.

**How it works:**
- If `SUPABASE_DB_URL` is set, it will be used directly.
- If only `SUPABASE_URL` is set, the backend will convert it (using the project ref and password) to the correct Postgres connection string for SQLAlchemy.

**Example .env:**
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PASSWORD=your_db_password
```

**Note:**
- These variables are only used by the backend. The frontend never sees or uses them.
- Never commit your real `.env` file or secrets to version control.

## Troubleshooting: PgBouncer and asyncpg DuplicatePreparedStatementError

If you see errors like:

    asyncpg.exceptions.DuplicatePreparedStatementError: prepared statement "__asyncpg_stmt_1__" already exists

This is a known issue when using SQLAlchemy (asyncpg) with PgBouncer in transaction/statement mode (the default for Supabase connection pooling).

**How to fix for local development:**
- Use the direct Postgres connection string (not the pooled one) in your `.env`:
  
      SUPABASE_DB_URL=postgresql+asyncpg://postgres:<your_password>@<host>:6543/postgres

- Or, ensure your `create_async_engine` uses:
  
      connect_args={"statement_cache_size": 0}

- Fully stop all backend processes and restart Supabase/PgBouncer if the error persists.

**Tip:** Use the provided `stop.sh` script at the project root to kill all running `uvicorn` and `python` processes before restarting the backend:

```bash
./stop.sh
```

This is especially useful for resolving PgBouncer/asyncpg prepared statement errors in development, or after using hot reloaders.

See SQLAlchemy and Supabase docs for more details.

## AI Analysis Endpoint (Phase 4)

This API is used for chat-based stock analysis via Retrieval-Augmented Generation (RAG).

### Endpoint
- **POST /api/ai/analyze**

### Request Body
```
{
  "tickers": ["AAPL", "GOOG"], // List of stock ticker symbols to analyze
  "query": "What is the outlook for these stocks?", // Natural language query
  "user_id": "optional-user-id" // Optional, for personalization
}
```

### Response
```
{
  "results": {
    "AAPL": {
      "matches": [ ... ], // Pinecone semantic search matches
      "rag_answer": "...", // LLM-generated answer
      "context": "..." // Context used for answer
    },
    "GOOG": { ... }
  },
  "status": "ok",
  "message": "RAG-augmented results (batch processed, cached). See PLANNING.md Phase 4."
}
```

### Authentication
- Requires a valid `X-API-Key` header (see API key setup in main README)

### Features
- Batch analysis (multi-ticker)
- Caching for embeddings, Pinecone results, and RAG answers
- Rate limiting per API key or IP
- Uses Pinecone for semantic search, OpenAI for embeddings, LangGraphService for LLM analysis

### Error Handling
- Returns 401 for missing/invalid API key
- Returns 500 for internal errors (see error message in response)

### Parent Documentation
See [PLANNING.md](../PLANNING.md#iteration-4-chat-interface--stock-analysis) for architectural context and goals.