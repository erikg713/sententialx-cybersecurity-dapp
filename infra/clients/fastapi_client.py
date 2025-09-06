# clients/fastapi_client.py
import os
import httpx
from typing import Dict

MODEL_SERVICE_URL = os.getenv("MODEL_SERVICE_URL", "http://model-server:8080")

async def call_model_service(prompt: str, model_endpoint: str = "/infer", **kwargs) -> Dict:
    url = MODEL_SERVICE_URL + model_endpoint
    async with httpx.AsyncClient(timeout=120.0) as client:
        payload = {"prompt": prompt}
        payload.update(kwargs)
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()
