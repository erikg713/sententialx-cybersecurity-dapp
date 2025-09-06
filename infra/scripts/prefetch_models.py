# scripts/prefetch_models.py
import os
import subprocess
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prefetch")

MODEL_TARGET_DIR = os.getenv("MODEL_DIR", "/models")
# put your model bucket path here or zipped artifacts
MODEL_PACKAGES = {
    "405b": "s3://mybucket/models/405b.tar.gz",
    "70b": "s3://mybucket/models/70b.tar.gz"
}

def download_and_unpack(name, url):
    target = Path(MODEL_TARGET_DIR) / name
    target.mkdir(parents=True, exist_ok=True)
    # example using AWS CLI - replace with gsutil or curl as needed
    archive = target.with_suffix(".tar.gz")
    logger.info(f"Downloading {url} -> {archive}")
    subprocess.check_call(["aws","s3","cp", url, str(archive)])
    logger.info("Extracting...")
    subprocess.check_call(["tar","-xzf", str(archive), "-C", str(target)])
    os.remove(archive)
    logger.info(f"{name} ready at {target}")

if __name__ == "__main__":
    for name, url in MODEL_PACKAGES.items():
        try:
            download_and_unpack(name, url)
        except Exception as e:
            logger.exception("Failed to prefetch %s: %s", name, e)
