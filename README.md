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
 ├── frontend/ (React)
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
 ├── backend/ (Node.js + Express)
 │   ├── server.js
 │   ├── routes/
 │   │   ├── auth.js
 │   │   ├── payments.js
 │   │   └── kyc.js
 │   ├── controllers/
 │   │   ├── authController.js
 │   │   ├── paymentsController.js
 │   │   └── kycController.js
 │   ├── models/
 │   │   └── UserSession.js
 │   ├── middleware/
 │   │   └── validateInput.js
 │   ├── config/
 │   │   └── db.js
 │   └── package.json
 ├── .env
 └── README.md
```
