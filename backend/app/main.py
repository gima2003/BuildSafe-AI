import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .predictor import model_service
from .preprocessor import load_bin_history_lookup
from .routes import predict, model, lookup, health

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("buildsafe_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle context manager to pre-load ML artifacts and lookup tables."""
    logger.info("Initializing BuildSafe-AI ML Model Service...")
    try:
        model_service.load_artifacts()
        load_bin_history_lookup()
        logger.info("BuildSafe-AI ML models and artifacts successfully loaded into memory.")
    except Exception as e:
        logger.error(f"Error loading models on startup: {e}")
    yield
    logger.info("Shutting down BuildSafe-AI ML Model Service...")

app = FastAPI(
    title="BuildSafe-AI - NYC DOB/ECB Violation Severity Triage API",
    description=(
        "Production-grade triage backend for NYC Department of Buildings / Environmental Control Board violations. "
        "Applies calibrated scikit-learn pipeline, leakage-masked NLP preprocessor, and human inspection flagging."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local development and client interfaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router)
app.include_router(predict.router)
app.include_router(model.router)
app.include_router(lookup.router)

@app.get("/")
def root():
    return {
        "project": "BuildSafe-AI",
        "description": "NYC DOB/ECB Violation Severity Triage Backend",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
