import os
from app.api.endpoints import health
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from app.config.openai_config import get_openai_settings
from fastapi.responses import JSONResponse
from app.utils.logging_utils import get_logger

# Load environment variables from .env file
load_dotenv()

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    settings = get_openai_settings()
    print(f"Starting TradeAdvisor API on port {PORT}")
    print(f"Environment: {ENVIRONMENT}")
    print(f"Allowed origins: {ALLOWED_ORIGINS}")
    # Log Supabase configuration status (without exposing sensitive values)
    print(f"Supabase URL configured: {'SUPABASE_URL' in os.environ}")
    print(f"Supabase Key configured: {'SUPABASE_KEY' in os.environ}")
    # Log OpenAI configuration status
    print(f"OpenAI API Key configured: {'OPENAI_API_KEY' in os.environ}")
    print(f"OpenAI Model configured: {settings.default_model}")
    print("SUPABASE_JWT_SECRET loaded:", bool(os.getenv("SUPABASE_JWT_SECRET")))
    yield
    # Shutdown
    print("Shutting down TradeAdvisor API")

# Get environment variables or use defaults
PORT = int(os.getenv("PORT", "8080"))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Configure CORS with environment-aware origins
NEXT_PUBLIC_APP_URL = os.getenv("NEXT_PUBLIC_APP_URL")

app = FastAPI(title="TradeAdvisor API", lifespan=lifespan)
logger = get_logger("app")

# Configure CORS
ALLOWED_ORIGINS = [NEXT_PUBLIC_APP_URL] if NEXT_PUBLIC_APP_URL else ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to BellaTry API",
        "environment": ENVIRONMENT,
        "port": PORT
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    ) 