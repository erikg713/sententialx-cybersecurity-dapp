# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, payments, kyc, ai_routes
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, kyc, payments, threats, dashboard
from db import database, models

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Sentenial-X API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(kyc.router)
app.include_router(payments.router)
app.include_router(threats.router)
app.include_router(dashboard.router)
app = FastAPI(title="Sentenial-X Backend", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include routes
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(kyc.router, prefix="/kyc", tags=["KYC"])
app.include_router(ai_routes.router, prefix="/ai", tags=["AI"])

@app.on_event("startup")
async def startup_event():
    print("Starting Sentenial-X Backend...")
    # Optional: Warmup AI models
    from app.ai_core.predictive_model import MODELS
    for key, model in MODELS.items():
        print(f"Loading model: {model.model_name}")

@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down Sentenial-X Backend...")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
