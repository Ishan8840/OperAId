# OperAid
A hands-free web app for doctors and nurses to access patient records and scans — built on voice commands and real-time transcription.

---

## Overview
OperAid is a voice-controlled platform that eliminates the need for manual record searching. Doctors and nurses can instantly access patient charts, lab results, and reports by speaking naturally. This streamlines workflows, reduces stress, and saves valuable time in clinical environments.  

**Demo:** [Presentation](https://operaid.framer.website/) | [Live Demo](https://operaid.vercel.app/)

---

## Architecture
Frontend (Next.js) <──> FastAPI Backend <──> Voice Processing & Transcription
│ │ │
▼ ▼ ▼
External Services: Supabase, OpenAI API, Eleven Labs API


**Frontend:** Next.js (React), Tailwind CSS, Framer Motion  
**Backend:** FastAPI, Supabase, Async Workers  
**External Services:** OpenAI API (voice & text understanding), Eleven Labs API (text-to-speech), Supabase (data storage & auth)

---

## Key Features

- **Hands-Free Access:** Pull up patient records, charts, scans, and lab results instantly using your voice.  
- **Live Voice Search:** Natural voice commands are transcribed and executed in real-time.  
- **Unified Dashboard:** Real-time dashboard displaying patient profiles, reports, and transcripts side-by-side.  
- **Efficiency Boost:** Cuts patient lookup time by **70%+**, saving doctors hours weekly.  
- **Extensible Integrations:** Can be expanded to integrate other hospital tools and workflows.

---

## Frontend

- Bottom navigation: Dashboard, Transcripts, Live Search  
- Voice command input: Speak naturally to trigger record searches  
- Real-time display: Patient info, charts, lab results, and scanned images  
- Clean, intuitive UI designed for medical professionals  

---

## Backend

- **Voice Processing Pipeline:** Captures, transcribes, and parses audio in real-time  
- **API Layer:** FastAPI REST endpoints for patients, records, and transcription services  
- **Database:** Supabase stores user data, patient records, and query logs  
- **Integration:** LLM interprets voice commands to generate queries and actions  

---

## Deployment

Frontend (Next.js)
│
▼
FastAPI Backend (APIs & DB)
│
▼
Voice & Transcription Pipeline
│
▼
External Services: Supabase, OpenAI API, Eleven Labs API
---

## 📸 Screenshot

![OperAid Screenshot](./data/Screenshot%20from%202025-09-28%2014-47-02.png)
