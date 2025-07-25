import os
import sys
from pathlib import Path
import logging
from typing import List
from dotenv import load_dotenv
import psycopg
from urllib.parse import urlparse

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create database connection using verified Supabase connection configuration."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_password = os.getenv("SUPABASE_PASSWORD")
    
    if not supabase_url:
        raise ValueError("SUPABASE_URL environment variable must be set")
    if not supabase_password:
        raise ValueError("SUPABASE_PASSWORD environment variable must be set")
    
    # Extract host from Supabase URL and construct direct connection URL
    parsed = urlparse(supabase_url)
    project_ref = parsed.hostname.split('.')[0]  # Get project ref from supabase URL
    db_url = f"postgresql://postgres:{supabase_password}@db.{project_ref}.supabase.co:6543/postgres"
    logger.info(f"Connection URL (with password hidden): {db_url.replace(supabase_password, '********')}")
    
    try:
        # Connect to database with SSL mode required
        conn = psycopg.connect(
            db_url,
            autocommit=True,  # Important for schema operations
            sslmode='require'  # Required for Supabase connections
        )
        logger.info("Successfully connected to database")
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        logger.error("Please check your database password and connection settings")
        raise

def get_migration_files() -> List[Path]:
    """Get sorted list of migration files."""
    migrations_dir = Path(__file__).parent / "migrations"
    if not migrations_dir.exists():
        raise FileNotFoundError(f"Migrations directory not found: {migrations_dir}")
    
    migration_files = sorted(migrations_dir.glob("*.sql"))
    logger.info(f"Found {len(migration_files)} migration files: {[f.name for f in migration_files]}")
    return migration_files

def read_migration_file(file_path: Path) -> str:
    """Read and return contents of a migration file."""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
            logger.info(f"Successfully read migration file: {file_path.name}")
            return content
    except Exception as e:
        logger.error(f"Error reading migration file {file_path}: {e}")
        raise

def run_migration(conn, migration_file: Path) -> None:
    """Execute a single migration file."""
    schema = "public"  # Supabase only allows public or graphql_public schemas
    logger.info(f"Running migration {migration_file.name} in schema: {schema}")
    
    sql = read_migration_file(migration_file)
    
    try:
        with conn.cursor() as cur:
            # Set search path to public schema
            logger.info(f"Setting search path to schema: {schema}")
            cur.execute(f"SET search_path TO {schema};")
            
            logger.info(f"Executing migration: {migration_file.name}")
            cur.execute(sql)
            
        logger.info(f"Successfully executed {migration_file.name}")
    except Exception as e:
        logger.error(f"Error executing migration {migration_file.name}: {e}")
        raise

def main():
    """Main migration runner."""
    try:
        schema = "public"  # Supabase only allows public or graphql_public schemas
        logger.info(f"Starting migrations in schema: {schema}")
        
        # Get database connection
        conn = get_db_connection()
        
        try:
            # Get migration files
            migration_files = get_migration_files()
            
            if not migration_files:
                logger.info("No migration files found.")
                return
            
            # Run each migration
            for migration_file in migration_files:
                run_migration(conn, migration_file)
                
            logger.info("All migrations completed successfully!")
            
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 