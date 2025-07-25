# Service Directory Structure (2025-07-17)

This directory contains all backend service logic for TradeAdvisor, organized for maintainability and future extensibility.

## Structure

- `core/`     — Core business services (NLU, orchestration, technical analysis, scoring)
- `data/`     — Data fetching services (stock, news, sentiment, SEC, social)
- `ai/`       — AI/ML services (OpenAI, embeddings, workflow orchestration, pattern recognition)
- `billing/`  — Billing & usage services (usage tracking, Stripe integration, plan management, rate limiting)
- `storage/`  — Data storage services (Pinecone, cache, database)
- `external/` — External API integrations (Alpha Vantage, Finnhub, Reddit, SEC Edgar)

## Migration Plan

1. **Phase 1.1:** Create new directory structure (this step)
2. **Phase 1.2:** Move services into appropriate directories, one group at a time
3. **Phase 1.3:** Update imports and dependencies after each move
4. **Phase 1.4:** Remove old files/directories after successful migration

**Note:** No service code has been moved yet. This README will be updated as migration progresses.

---

For more details, see [../../PLANNING.md](../../PLANNING.md#backend-reorganization-plan) 