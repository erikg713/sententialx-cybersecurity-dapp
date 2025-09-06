# backend/Dockerfile
# NVIDIA base with CUDA runtime suitable for PyTorch + DeepSpeed
FROM nvcr.io/nvidia/pytorch:24.03-py3   ## choose tag that fits your infra (or nvidia/cuda base if you prefer)

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    git gcc g++ libsndfile1 ffmpeg \
 && rm -rf /var/lib/apt/lists/*

# Copy project
COPY ./app /app/app
COPY ./backend/requirements.txt /app/requirements.txt

# Python
RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install -r /app/requirements.txt

# Create folder for model cache mounted from PVC
RUN mkdir -p /models && chown -R 1000:1000 /models

# Expose
EXPOSE 8000

# Entrypoint (uvicorn)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
