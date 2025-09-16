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



Upload Leads

Sample leads.csv


name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,B2B SaaS mid-market,San Francisco,"Driving SaaS growth..."
Rohit Sharma,Software Engineer,TechSpark,EdTech,Bangalore,"Developer and problem solver"
Lisa Wong,VP Marketing,CloudX,B2B SaaS mid-market,New York,"10+ years in SaaS marketing"
name,role,company,industry,location,linkedin_bio
Arjun Mehta,Product Manager,InnoTech,B2C FinTech,Mumbai,"Building user-first products with scalable impact"
Sophia Lee,Data Scientist,HealthAI,Healthcare AI,Singapore,"Turning health data into actionable insights"
Daniel Smith,CTO,GreenGrid,Renewable Energy,London,"Leading innovation in sustainable tech"
Priya Nair,Marketing Lead,EdFuture,EdTech,Delhi,"Driving growth with data-driven campaigns"
Michael Johnson,Full Stack Engineer,ShopSphere,E-commerce,New York,"Passionate about scalable architecture and performance"

Upload command:

curl -X POST http://localhost:8080/leads/upload \
  -F "file=@leads.csv"

Response

{ "status": "ok", "uploaded": 3 }

Run Scoring

curl -X POST http://localhost:8080/score


Get Results

Example Output


[
  {
    "name": "Ava Patel",
    "role": "Head of Growth",
    "company": "FlowMetrics",
    "industry": "B2B SaaS mid-market",
    "intent": "High",
    "score": 85,
    "reasoning": "Her role aligns with SaaS ICP and she is a decision maker."
  },
  {
    "name": "Rohit Sharma",
    "role": "Software Engineer",
    "company": "TechSpark",
    "industry": "EdTech",
    "intent": "Low",
    "score": 20,
    "reasoning": "Not a decision maker, different industry, weak signals."
  }
]


Notes
	•	This is a prototype assignment project → storage is in-memory (no DB).
	•	Works perfectly for demo + hackathon style submissions.
	•	Can be extended with:
	•	CSV export endpoint.



⸻

Author

Built with focus on clarity, speed, and explainability.

