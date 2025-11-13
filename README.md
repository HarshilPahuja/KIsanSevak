# KisanSevak – AI-driven Farmer Assistance Platform

KisanSevak is a digital support platform designed to empower farmers with **weather-aware insights**, **AI-driven advisory**, and **market intelligence**. The platform integrates satellite-based farm area estimation, real-time crop price dashboards, and a fine-tuned conversational assistant to guide farmers in making informed agricultural decisions.

### Live Demo
**URL:** https://kisansevak.vercel.app/

---

## 🌱 Key Features

| Feature | Description |
|--------|-------------|
| **AI Conversational Chatbot** | Fine-tuned Gemini-based assistant trained on crop, soil, irrigation, and cultivation domain knowledge. Helps farmers with real-time guidance. |
| **Weather-Based Precaution Alerts** | Uses weather intelligence + Gemini reasoning to provide early warnings and actionable advisories. |
| **Satellite Land Analysis** | Mapbox-based location capture and polygon estimation to calculate approximate farmland area. |
| **Market Insight Dashboard** | Displays real-time mandi (market) prices, cost–yield estimation, and predicted net profit metrics for selected crops. |
| **Farmer-friendly UI** | Clean and multilingual-ready user interface designed for ease of use in rural contexts. |

---

## 🛠️ Tech Stack

| Layer | Tools & Technologies |
|------|----------------------|
| **Frontend** | React.js, JavaScript, Mapbox API, Tailwind |
| **Backend** | Supabase (Host + Auth + PostgreSQL Database) |
| **AI Engine** | Gemini API (Chat + Reasoning + Weather advisory prompts) |
| **Deployment** | Vercel (Frontend), Supabase Cloud (Backend + DB) |

---

## 🚀 Steps & Requirements

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/KisanSevak.git
cd KisanSevak

npm install

create a .env File in the Project Root

Add the following environment variables:

VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_GEMINI_API_KEY=<your-gemini-api-key>
VITE_MAPBOX_ACCESS_TOKEN=<your-mapbox-token>

Start the Development Server
npm run dev




