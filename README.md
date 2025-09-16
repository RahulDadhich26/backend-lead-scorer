# Lead Qualification & Scoring Backend

A lightweight backend service to **qualify and score leads** using rule-based logic and **AI reasoning (Gemini AI)**.  
Built for **clean APIs, fast integration, and explainable scoring**.

---

## Features

- **Offer Management**: Store product/offer context.
- **Leads Upload**: Upload CSV files of prospects.
- **Scoring Pipeline**:
  - **Rule Layer**: Scores based on role, industry, and data completeness (max 50 pts).
  - **AI Layer**: Gemini AI classification & reasoning (max 50 pts).
  - **Final Score**: Combined Rule + AI score.
- **Results API**: Get structured JSON for all scored leads.
- **Extensible**: Easy to add CSV export, database integration, and other features.

---

## Tech Stack

- Node.js + TypeScript + Express
- Gemini AI API for reasoning
- Multer & csv-parse for file uploads
- In-memory storage for leads/offers (stateless and simple)

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/RahulDadhich26/backend-lead-scorer.git
cd backend-lead-scorer
npm install
```

### 2. Setup Environment

Create a `.env` file in the project root:

```
PORT=8080
GEMINI_API_KEY=your_real_gemini_api_key_here
AI_TIMEOUT_MS=15000
```

### 3. Run Server

```bash
npm run dev
```

Server will start at: [http://localhost:8080](http://localhost:8080)

---

## API Usage

### Health Check

```bash
curl https://backend-lead-scorer.onrender.com/
```

**Sample response:**
```json
{ "status": "ok", "message": "Backend Lead Scorer" }
```

### Set Offer

```bash
curl -X POST https://backend-lead-scorer.onrender.com/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"]
  }'
```

### Upload Leads

Prepare a sample `leads.csv`:

```
name,role,company,industry,location,linkedin_bio
Ava Patel,Head of Growth,FlowMetrics,B2B SaaS mid-market,San Francisco,"Driving SaaS growth..."
Rohit Sharma,Software Engineer,TechSpark,EdTech,Bangalore,"Developer and problem solver"
Lisa Wong,VP Marketing,CloudX,B2B SaaS mid-market,New York,"10+ years in SaaS marketing"
```

Upload leads:

```bash
curl -X POST https://backend-lead-scorer.onrender.com/leads/upload \
  -F "file=@leads.csv"
```

**Sample response:**
```json
{ "status": "ok", "uploaded": 3 }
```

### Run Scoring

```bash
curl -X POST https://backend-lead-scorer.onrender.com/score
```

### Get Results

**Sample output:**

```json
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
```

---

## Notes

- This is a prototype assignment project; storage is in-memory (no database).
- Works perfectly for demos and hackathon-style submissions.
- Easily extended for features like CSV export, database integration, etc.

---

## Author

Built with a focus on clarity, speed, and explainability.
