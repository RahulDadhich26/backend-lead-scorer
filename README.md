# Lead Qualification & Scoring Backend  

This project is a lightweight backend service designed to **qualify and score leads** using a combination of **rule-based logic** and **AI reasoning (Gemini AI)**.  

It was built with a focus on **clean APIs, quick integration, and explainable scoring**.  

---

## Features  
- Offer Management → Store product/offer context  
- Leads Upload → Upload CSV of prospects  
- Scoring Pipeline  
  - Rule Layer (Role, Industry, Data completeness → max 50 pts)  
  - AI Layer (Gemini AI classification & reasoning → max 50 pts)  
  - Final Score = Rule + AI  
- Results API → Get structured JSON of all scored leads  
- Extensible → Easy to add CSV export, Docker deployment, DB integration  

---

## Tech Stack  
- Node.js + TypeScript + Express  
- Gemini AI API for reasoning  
- Multer + csv-parse for file uploads  
- In-memory storage for leads/offers (simple + stateless)  

---

## Quick Start  

### 1. Clone & Install  
```bash
git clone https://github.com/yourusername/backend-lead-scorer.git
cd backend-lead-scorer
npm install


2. Setup Environment
Create a .env file in the project root:

PORT=8080
GEMINI_API_KEY=your_real_gemini_api_key_here
AI_TIMEOUT_MS=15000


3. Run Server
npm run dev

Server will run on → http://localhost:8080

API Usage

Health Check

curl http://localhost:8080/

Response
in json 
{ "status": "ok", "message": "Backend Lead Scorer" }

Set Offer

curl -X POST http://localhost:8080/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"]
  }'

  