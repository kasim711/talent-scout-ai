# TalentScout — End-to-End AI Recruiting Agent  
> Built for Catalyst Hackathon · Deccan AI

TalentScout is an AI-powered recruiting system that automates the entire hiring pipeline:

**Job Description → Candidate Matching → AI Outreach → Final Shortlist**

All powered through a **single intelligent agent + real-time interaction layer**

---

##  What Makes It Different

-  Single AI Call Architecture (fast + cost-efficient)
-  Explainable scoring system 
-  Human-like engagement simulation
-  Fully state-managed pipeline (no refresh needed)
-  Actionable shortlist output

---

## Quick Start

### 1. Get OpenRouter API Key (Free)
https://openrouter.ai/keys  

### 2. Setup

# Install dependencies
npm install

# Create .env inside server folder
cd server
cp .env.example .env

# Add your API key
OPENROUTER_API_KEY=your_key_here

---

### 3. Run the Application

#### Start Backend

cd server  
npm install  
node index.js  

Backend runs at:  
http://localhost:8000  

---

#### Start Frontend (in new terminal)

npm install  
npm start  

Frontend runs at:  
http://localhost:3000  
---

##  How It Works

###  Full Pipeline

JD Input → AI Agent → Candidate Scoring → Engagement → Shortlist

---

###  Step 1 — Run Agent (Core Engine)

One AI call performs:
- JD parsing
- Candidate scoring
- Outreach message generation
- Recruiter note generation

Example output:

{
  "parsedJD": { "...": "..." },
  "candidates": [
    {
      "id": 1,
      "matchScore": 85,
      "outreachMessage": "Hi, your React experience stood out...",
      "recruiterNote": "Strong fit, proceed to interview",
      "action": "Schedule Interview"
    }
  ]
}

---

###  Step 2 — Candidate Matching

Candidates are ranked using AI-generated scores.

Match Score considers:
- Skill overlap  
- Experience alignment  
- Salary fit  

---

###  Step 3 — Engagement Simulation

- AI sends outreach message  
- You reply as candidate  
- System simulates real recruiter interaction  

Interest Score logic:
- Base score (50)  
- Positive / negative sentiment keywords  
- Engagement depth (message count)  

---

###  Step 4 — Final Shortlist

Combined Score:

Match × 0.6 + Interest × 0.4

Output includes:
- Ranked candidates  
- Recruiter notes  
- Recommended actions:
  - Schedule Interview
  - Follow Up
  - Hold
  - Pass  

---

## Architecture

React Frontend  
│  
├── JDParser  
├── CandidateMatcher  
├── EngagementChat  
└── Shortlist  
│  
└── Express Backend (Node.js)  
        ↓  
   OpenRouter API (LLM)  

---

## Project Structure

src/  
├── components/  
│   ├── JDParser.js  
│   ├── CandidateMatcher.js  
│   ├── EngagementChat.js  
│   └── Shortlist.js  
├── lib/  
│   ├── sir.js  
│   └── candidates.js  
├── App.js  
└── App.css  

server/  
└── index.js  

---

## Environment Variables(.env in server folder)

OPENROUTER_API_KEY=your_key_here

---

## Key Features

-  Single-call AI pipeline (optimized performance)  
-  Conversational candidate simulation  
-  Hybrid scoring (AI + deterministic logic)  
-  Resettable workflow without page reload  
-  Real-time metrics dashboard  

---

## Limitations

- Uses static candidate dataset (demo purpose)  
- Interest score depends on user input simulation  
- API usage subject to OpenRouter free-tier limits  

---

## Author

Kasim Nalawala  
Built for Catalyst - Deccan AI Hackathon  

---

## Final Note

TalentScout demonstrates how AI can streamline the hiring lifecycle — from job description to final shortlist — reducing manual effort while improving decision quality.

