# Database Migrations

This directory contains SQL migration scripts for the backend database schema.

## Migration Files

- `001_create_health_table.sql`: Creates the health check table.
- `002_create_watchlists_table.sql`: Creates the watchlists table.
- `003_enable_rls_watchlists.sql`: Enables Row Level Security (RLS) and adds policies for the watchlists table. **Note:** Policy creation is now idempotent and safe to run multiple times or in different environments.
- `004_create_ingested_items_table.sql`: Creates the `ingested_items` table and a unique index for deduplication tracking in the ingestion pipeline.

## Running Migrations

Use the migration script to apply all migrations in order:

```bash
./db/run_migrations.sh
```

- The script will apply all migrations in sequence.
- Migrations are safe to run in both development and production environments.
- If a migration fails due to an existing policy or table, it will not block subsequent migrations (idempotency is ensured for policies).

## Notes

- The `ingested_items` table is used for persistent deduplication in the ingestion pipeline (see pipeline documentation for usage).
- Always ensure your environment variables (e.g., `SUPABASE_URL`, `SUPABASE_KEY`) are set before running migrations.
- You can also run the SQL files manually in the Supabase SQL editor if needed. 