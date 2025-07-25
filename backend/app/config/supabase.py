import os
import logging
from supabase import create_client, Client
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Debug: Print environment variables (safely)
logger.info("Checking Supabase configuration:")
logger.info(f"SUPABASE_URL present: {'SUPABASE_URL' in os.environ}")
logger.info(f"SUPABASE_KEY present: {'SUPABASE_KEY' in os.environ}")
logger.info(f"SUPABASE_SCHEMA present: {'SUPABASE_SCHEMA' in os.environ}")

# Supabase configuration from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase_client() -> Client:
    """
    Create and return a Supabase client instance.
    Using environment variables for configuration.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("Supabase configuration missing:")
        logger.error(f"SUPABASE_URL: {'set' if SUPABASE_URL else 'missing'}")
        logger.error(f"SUPABASE_KEY: {'set' if SUPABASE_KEY else 'missing'}")
        raise ValueError(
            "Supabase configuration missing. "
            "Please set SUPABASE_URL and SUPABASE_KEY environment variables."
        )
    
    try:
        # Initialize client with environment variables
        logger.info(f"Initializing Supabase client with URL: {SUPABASE_URL}")
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Successfully created Supabase client")
        return client
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        raise 

def is_item_ingested(item_type: str, symbol: str, source_id: str) -> bool:
    """
    Check if an item (by type, symbol, and source_id) is already present in the ingested_items table.
    Returns True if exists, False otherwise.
    """
    client = get_supabase_client()
    query = (
        client.table("ingested_items")
        .select("id")
        .eq("type", item_type)
        .eq("source_id", source_id)
    )
    if symbol is not None:
        query = query.eq("symbol", symbol)
    result = query.execute()
    return bool(result.data)


def insert_ingested_item(item_type: str, symbol: str, source_id: str, extra_metadata: dict = None):
    """
    Insert a new ingested item into the ingested_items table.
    Ignores duplicate errors due to unique index.
    """
    client = get_supabase_client()
    data = {
        "type": item_type,
        "symbol": symbol,
        "source_id": source_id,
        "extra_metadata": extra_metadata or {},
    }
    try:
        client.table("ingested_items").insert(data).execute()
    except Exception as e:
        logger.warning(f"Insert to ingested_items failed (may be duplicate): {e}") 