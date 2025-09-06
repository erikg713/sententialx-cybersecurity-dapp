# Sentenial X – Cyber Guardian

An advanced cyber defense platform scaffold, compliant with Pi Network Mainnet guidelines.

## Features
- Pi Authentication SDK login
- Pi-only Payments
- KYC Verification placeholder
- Threat Dashboard (React UI)
- Node.js backend (Express)

## Run Instructions
1. **Frontend**: `cd frontend && npm install && npm start`
2. **Backend**: `cd backend && npm install && npm start`

## Compliance
- Pi Authentication only (no email/3rd party login)
- Pi-only transactions
- No external redirects
- Minimal data collection
```
sentenial-x/
├── frontend/                 # React frontend remains unchanged
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── api.js
│   │   ├── styles.css
│   │   └── components/
│   │       ├── Login.js
│   │       ├── Dashboard.js
│   │       ├── ThreatFeed.js
│   │       ├── Payments.js
│   │       └── KYC.js
│   └── package.json
│
├── backend/                  # Python FastAPI backend
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── payments.py
│   │   │   ├── kyc.py
│   │   │   └── ai_routes.py
│   │   ├── controllers/
│   │   │   ├── auth_controller.py
│   │   │   ├── payments_controller.py
│   │   │   ├── kyc_controller.py
│   │   │   └── ai_controller.py
│   │   ├── models/
│   │   │   └── user_session.py
│   │   ├── middleware/
│   │   │   └── validate_input.py
│   │   ├── config/
│   │   │   └── db.py
│   │   └── ai_core/          # Deep infra AI modules
│   │       ├── __init__.py
│   │       ├── predictive_model.py
│   │       ├── wormgpt_detector.py
│   │       ├── attack_simulator.py
│   │       ├── threat_analyzer.py
│   │       ├── embeddings_service.py
│   │       └── utils.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── .env
└── README.md
