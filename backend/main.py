"""
backend/main.py

Clean, robust FastAPI application entrypoint for Sentenial-X Backend.
- Centralized configuration via pydantic BaseSettings
- Structured logging
- Safe, best-effort router imports with clear warnings if a module is missing
- Health and root endpoints
- Startup/shutdown lifecycle hooks for warming models and graceful shutdown
- Configurable CORS origins via environment variable (comma-separated)
"""

from typing import List, Optional
import os
import logging
import importlib
import uvicorn

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseSettings

# Optional DB/models import - attempt but fail gracefully
_database = None
_models = None

try:
    from db import database as _database  # type: ignore
    from db import models as _models  # type: ignore
except Exception as exc:  # pragma: no cover - best-effort import
    _database = None
    _models = None

# Application settings
class Settings(BaseSettings):
    app_name: str = "Sentenial-X Backend"
    version: str = "1.0.0"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    reload: bool = False
    # Comma-separated list or '*' for all
    allowed_origins: str = "*"  # e.g. "https://app.example.com,https://admin.example.com"

    class Config:
        env_prefix = "SENTENIALX_"
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Configure logging
logger = logging.getLogger("sentenialx")
log_level = logging.DEBUG if settings.debug else logging.INFO
logging.basicConfig(
    level=log_level,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

# Create FastAPI app
app = FastAPI(title=settings.app_name, version=settings.version, debug=settings.debug)

# CORS setup
def parse_origins(origins_value: str) -> List[str]:
    origins_value = origins_value.strip()
    if origins_value == "*" or origins_value == "":
        return ["*"]
    return [o.strip() for o in origins_value.split(",") if o.strip()]

allowed_origins = parse_origins(settings.allowed_origins)
logger.debug("CORS allowed origins: %s", allowed_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utility: safe router include
def try_include_router(module_path: str, router_attr: str = "router", prefix: Optional[str] = None, tags: Optional[List[str]] = None):
    """
    Attempt to import a module and include its router on the app.
    Logs a clear warning if import fails.
    """
    try:
        module = importlib.import_module(module_path)
        router = getattr(module, router_attr, None)
        if router is None or not isinstance(router, APIRouter):
            logger.warning("Module '%s' does not expose an APIRouter named '%s'. Skipping.", module_path, router_attr)
            return
        app.include_router(router, prefix=prefix or "", tags=tags or [])
        logger.info("Included router from %s (prefix=%s)", module_path, prefix or "")
    except Exception as exc:
        logger.warning("Could not include router from %s: %s", module_path, exc)

# Include known routers (best-effort to support different project structures)
# Common locations in this repo historically: "app.routes.*" or "api.*"
try_include_router("app.routes.auth", prefix="/auth", tags=["Auth"])
try_include_router("api.auth", prefix="/auth", tags=["Auth"])

try_include_router("app.routes.payments", prefix="/payments", tags=["Payments"])
try_include_router("api.payments", prefix="/payments", tags=["Payments"])

try_include_router("app.routes.kyc", prefix="/kyc", tags=["KYC"])
try_include_router("api.kyc", prefix="/kyc", tags=["KYC"])

try_include_router("app.routes.ai_routes", prefix="/ai", tags=["AI"])
try_include_router("api.threats", prefix="/threats", tags=["Threats"])
try_include_router("api.dashboard", prefix="/dashboard", tags=["Dashboard"])

# Health and root endpoints
@app.get("/", tags=["Root"])
async def root():
    return {"service": settings.app_name, "version": settings.version, "status": "ok"}

@app.get("/health", tags=["Health"])
async def health():
    # Add lightweight checks here if needed (DB connection, caches, etc.)
    checks = {"app": "ok"}
    if _database is not None:
        try:
            # If the database package exposes a .ping or .engine, try simple check
            engine = getattr(_database, "engine", None)
            if engine is not None:
                # Simple no-op to ensure engine is available. Do not open new connections here.
                checks["database"] = "available"
            else:
                checks["database"] = "unknown"
        except Exception:
            checks["database"] = "unavailable"
    else:
        checks["database"] = "not-configured"
    return {"status": "ok", "checks": checks}

# Lifecycle events
@app.on_event("startup")
async def on_startup() -> None:
    logger.info("Starting %s...", settings.app_name)
    # Initialize DB schema if available
    if _models is not None and _database is not None:
        try:
            Base = getattr(_models, "Base", None)
            engine = getattr(_database, "engine", None)
            if Base is not None and engine is not None:
                Base.metadata.create_all(bind=engine)
                logger.info("Database schema checked/created.")
            else:
                logger.debug("DB models or engine not found; skipping create_all()")
        except Exception as exc:
            logger.exception("Failed to initialize database schema: %s", exc)

    # Warm up AI models if present
    try:
        ai_module = importlib.import_module("app.ai_core.predictive_model")
        MODELS = getattr(ai_module, "MODELS", None)
        if isinstance(MODELS, dict):
            for key, model in MODELS.items():
                try:
                    model_name = getattr(model, "model_name", str(model))
                    logger.info("Warming model: %s", model_name)
                    # Optional: call a lightweight warmup method if present
                    warm = getattr(model, "warmup", None)
                    if callable(warm):
                        try:
                            warm()
                        except Exception:
                            logger.debug("Model warmup failed for %s (non-fatal).", model_name)
                except Exception:
                    logger.debug("Unable to inspect model %s", key)
    except ModuleNotFoundError:
        logger.debug("AI predictive model module not found; skipping warmup.")
    except Exception as exc:
        logger.exception("Error during AI model warmup: %s", exc)

@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("Shutting down %s...", settings.app_name)
    # Close DB connections if provided
    try:
        close_fn = getattr(_database, "disconnect", None)
        if callable(close_fn):
            await close_fn()  # type: ignore
            logger.info("Database disconnected.")
    except Exception:
        logger.debug("No async disconnect available or disconnect failed.")

# Run using "python backend/main.py"
def main():
    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level="debug" if settings.debug else "info",
    )

if __name__ == "__main__":
    main()
