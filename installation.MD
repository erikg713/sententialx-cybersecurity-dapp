### 🚀 Sentenial-X Installation Guide ###
--------------------------------------------
This guide shows how to set up Sentenial-X with React frontend, FastAPI backend, and deep-infra AI core (Meta-LLaMA, WormGPT detector, etc.) on both local (Docker Compose) and production (Kubernetes).


---

1. 📦 Prerequisites

System

Ubuntu 22.04 LTS (recommended)

NVIDIA GPU (A100, H100, or >=24GB VRAM for large models)

At least 200GB free disk space (models cache)


Installed Software

# System packages
sudo apt update && sudo apt install -y git curl wget python3 python3-venv build-essential

# Docker + NVIDIA runtime
curl -fsSL https://get.docker.com | sh
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Docker Compose
sudo apt install docker-compose-plugin -y

# Kubernetes + Helm (for production)
curl -LO "https://dl.k8s.io/release/$(curl -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# NVIDIA K8s plugin
kubectl create -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.14.0/nvidia-device-plugin.yml


---

2. 📂 Clone Sentenial-X

git clone https://github.com/YOUR_ORG/sentenial-x.git
cd sentenial-x

Your structure should look like:

sentenial-x/
├── frontend/   (React)
├── backend/    (FastAPI + AI core)
└── infra/      (Docker + K8s manifests)


---

3. 🐍 Python Backend Setup (local dev)

cd backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

Run locally:

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

API available at → http://localhost:8000/docs


---

4. 🌐 Frontend Setup

cd frontend
npm install
npm run dev

Frontend → http://localhost:5173 (Vite default)


---

5. 📥 Prefetch AI Models (Docker)

First, build the prefetch container:

cd infra/docker
docker build -t sentenial-prefetch -f Dockerfile.prefetch .

Run prefetch with mounted volume:

docker run --gpus all -v /mnt/models:/opt/models sentenial-prefetch

Now /mnt/models contains all cached models (LLaMA, WormGPT, etc.).


---

6. 🐳 Run with Docker Compose

Create .env at project root:

POSTGRES_URL=postgresql://user:pass@db:5432/sentenialx
HF_HOME=/opt/models
TRANSFORMERS_CACHE=/opt/models

Then:

docker compose up --build

Services:

Frontend → http://localhost:3000

Backend → http://localhost:8000

Postgres → localhost:5432

Prefetched models mounted in /opt/models



---

7. ☸️ Deploy to Kubernetes (production)

7.1 Create Namespace & Secrets

kubectl create namespace sentenial-x
kubectl create secret generic sentenial-secrets \
  --from-literal=DB_URL=postgresql://user:pass@db:5432/sentenialx \
  -n sentenial-x

7.2 Apply PVC for models

# infra/k8s/pvc-models.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: sentenial-models-pvc
  namespace: sentenial-x
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 500Gi

kubectl apply -f infra/k8s/pvc-models.yaml

7.3 Prefetch Models (K8s Job)

kubectl apply -f infra/k8s/job-prefetch.yaml

7.4 Deploy Core Services

kubectl apply -f infra/k8s/deployment-backend.yaml
kubectl apply -f infra/k8s/deployment-frontend.yaml
kubectl apply -f infra/k8s/service-backend.yaml
kubectl apply -f infra/k8s/service-frontend.yaml

7.5 Autoscaling & Stability

kubectl apply -f infra/k8s/hpa-backend.yaml
kubectl apply -f infra/k8s/pdb-backend.yaml


---

8. ✅ Verify Deployment

Check pods:

kubectl get pods -n sentenial-x

Backend logs:

kubectl logs -n sentenial-x deploy/sentenial-backend

Frontend URL (LoadBalancer / Ingress):

kubectl get svc -n sentenial-x


---

9. 🎯 Summary

Local Dev → uvicorn + npm run dev

Docker → build + compose + prefetch

Kubernetes → namespace, PVC, prefetch job, backend + frontend deployments



---
