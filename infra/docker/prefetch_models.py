# infra/docker/prefetch_models.py
import os
from huggingface_hub import snapshot_download

# Destination
cache_dir = os.getenv("HF_HOME", "/opt/models")

# Models to prefetch (update as needed)
models = [
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "meta-llama/Meta-Llama-3.1-70B-Instruct",
    "meta-llama/Meta-Llama-3.1-405B-Instruct",
    "meta-llama/Llama-3.3-70B-Instruct",
    "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    # add WormGPT detector weights if hosted on HF
]

for model in models:
    print(f"📥 Downloading {model} into {cache_dir}")
    snapshot_download(repo_id=model, cache_dir=cache_dir, ignore_patterns=["*.pt", "*.bin"])  # filter if needed

print("✅ Model prefetch complete. Cache ready at", cache_dir)
