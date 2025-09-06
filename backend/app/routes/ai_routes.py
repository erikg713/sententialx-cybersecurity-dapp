# backend/app/routes/ai_routes.py
from fastapi import APIRouter, HTTPException
from app.ai_core.wormgpt_detector import classify_wormgpt
from app.ai_core.attack_simulator import simulate_attack
from app.ai_core.threat_analyzer import analyze_threat

router = APIRouter()

@router.post("/analyze_threat")
async def api_analyze_threat(payload: dict):
    text = payload.get("text")
    complexity = payload.get("complexity", "medium")
    if not text:
        raise HTTPException(status_code=400, detail="Missing 'text' field")
    return await analyze_threat(text, complexity)

@router.post("/classify_wormgpt")
async def api_classify_wormgpt(payload: dict):
    text = payload.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Missing 'text' field")
    return await classify_wormgpt(text)

@router.post("/simulate_attack")
async def api_simulate_attack(payload: dict):
    text = payload.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Missing 'text' field")
    return await simulate_attack(text)
