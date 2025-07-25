from typing import Optional, Dict, Any
import os
from pydantic_settings import BaseSettings
from pydantic import Field
from pydantic import ConfigDict
from functools import lru_cache
from dotenv import load_dotenv

# Ensure .env is loaded for all usages
load_dotenv(override=True)

print("DEBUG: OPENAI_DEFAULT_MODEL =", os.environ.get("OPENAI_DEFAULT_MODEL"))
print("DEBUG: OPENAI_EMBEDDING_MODEL =", os.environ.get("OPENAI_EMBEDDING_MODEL"))

class OpenAISettings(BaseSettings):
    """
    OpenAI configuration settings.
    These can be set via environment variables with the prefix OPENAI_
    """
    model_config = ConfigDict(env_file='.env', env_prefix='OPENAI_')
    # Organization settings
    ORGANIZATION_ID: Optional[str] = Field(
        default=None,
        description="OpenAI Organization ID for team usage tracking"
    )
    
    # API Keys
    API_KEY: str = Field(
        ...,  # This makes it required
        description="Primary OpenAI API key"
    )
    BACKUP_API_KEY: Optional[str] = Field(
        default=None,
        description="Backup API key for failover"
    )
    
    # Model settings
    DEFAULT_MODEL: str = Field(
        default="gpt-4-turbo-preview",
        description="Default model to use"
    )
    EMBEDDING_MODEL: str = Field(
        default="text-embedding-ada-002",
        description="Model to use for embeddings"
    )
    
    # Rate limiting settings
    RATE_LIMIT_RPM: int = Field(
        default=60,
        description="Rate limit for API calls per minute"
    )
    
    # Cost tracking settings
    ENABLE_COST_TRACKING: bool = Field(
        default=True,
        description="Whether to track API usage costs"
    )
    
    # Base Configuration
    api_key: str
    organization: str | None = None
    
    # Default Model Settings
    default_model: str = Field(default="gpt-4-turbo-preview")
    default_temperature: float = 0.7
    
    # Agent-Specific Model Settings (can be loaded from env as JSON if needed)
    agent_models: Dict[str, str] = Field(default_factory=lambda: {
        "technical": "gpt-4-turbo-preview",
        "news": "gpt-4-turbo-preview",
        "sentiment": "gpt-4-turbo-preview"
    })
    agent_temperatures: Dict[str, float] = Field(default_factory=lambda: {
        "technical": 0.3,
        "news": 0.7,
        "sentiment": 0.5
    })
    
    # Pricing dictionary
    pricing: Dict[str, Dict[str, float]] = Field(default_factory=lambda: {
        "gpt-3.5-turbo": {
            "input": 0.0005,
            "output": 0.0015
        },
        "gpt-4": {
            "input": 0.03,
            "output": 0.06
        },
        "text-embedding-ada-002": {
            "input": 0.0001,
            "output": 0.0001
        }
    })
    
    # Retry Configuration
    max_retries: int = 3
    retry_delay: float = 1.0

    # OpenRouter settings
    OPENROUTER_API_KEY: Optional[str] = Field(
        default=None,
        description="OpenRouter API key (if using OpenRouter)"
    )
    OPENROUTER_BASE_URL: str = Field(
        default="https://openrouter.ai/api/v1",
        description="Base URL for OpenRouter API"
    )
    USE_OPENROUTER: bool = Field(
        default=False,
        description="Whether to use OpenRouter instead of OpenAI directly"
    )

    @property
    def embedding_model(self) -> str:
        return self.EMBEDDING_MODEL

@lru_cache()
def get_openai_settings() -> OpenAISettings:
    """
    Get OpenAI settings, with proper error handling.
    """
    try:
        settings = OpenAISettings()
        print("DEBUG: settings.default_model =", settings.default_model)
        return settings
    except Exception as e:
        raise ValueError(f"Failed to load OpenAI settings: {str(e)}")

def get_agent_settings(agent_type: str) -> Dict[str, Any]:
    """Get settings for a specific agent type"""
    settings = get_openai_settings()
    return {
        "model": settings.agent_models.get(agent_type, settings.default_model),
        "temperature": settings.agent_temperatures.get(agent_type, settings.default_temperature),
        "api_key": settings.api_key,
        "organization": settings.organization
    }

# Example usage of environment variables:
"""
# Required
OPENAI_API_KEY=your_primary_api_key

# Optional
OPENAI_ORGANIZATION_ID=org-xxxxx
OPENAI_BACKUP_API_KEY=your_backup_key
OPENAI_DEFAULT_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002
OPENAI_RATE_LIMIT_RPM=60
OPENAI_ENABLE_COST_TRACKING=true
"""

EMBEDDING_MODEL_DIMENSIONS = {
    "text-embedding-ada-002": 1536,
    # Add more models here if needed
}

def get_embedding_dimension():
    model = get_openai_settings().EMBEDDING_MODEL
    return EMBEDDING_MODEL_DIMENSIONS.get(model, 1536) 