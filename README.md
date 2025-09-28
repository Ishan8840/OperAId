# OperAid

OperAid is a voice-controlled platform that eliminates the need for manual record searching. Doctors and nurses can instantly access patient charts, lab results, and reports by speaking naturally. This streamlines workflows, reduces stress, and saves valuable time in clinical environments.  

**Demo:** [Presentation](https://operaid.framer.website/) | [Live Demo](https://operaid.vercel.app/)

---

## Architecture
```text
[ Frontend (Next.js) ] <--> [ FastAPI Backend ] <--> [ Voice Processing & Transcription ]
            |                           |                           |
            v                           v                           v
            External Services: Supabase | OpenAI API | Eleven Labs API
```

**Frontend:** Next.js (React), Tailwind CSS  
**Backend:** FastAPI, Supabase, Async Workers  
**External Services:** OpenAI API (text understanding), Eleven Labs API (speech-to-text), Supabase (data storage)

---

## Key Features

- **Hands-Free Access:** Pull up patient records, charts, scans, and lab results instantly using your voice.  
- **Live Voice Search:** Natural voice commands are transcribed and executed in real-time.  
- **Unified Dashboard:** Real-time dashboard displaying patient profiles, reports, and transcripts side-by-side.  
- **Efficiency Boost:** Cuts patient lookup time by **70%+**, saving doctors hours weekly.  
- **Extensible Integrations:** Can be expanded to integrate other hospital tools and workflows.

---

## Frontend

- **Bottom navigation:** Dashboard, Transcripts, Live Search  
- **Voice command input:** Speak naturally to trigger record searches  
- **Real-time display:** Patient info, charts, lab results, and scanned images  

---

## Backend

- **Voice Processing Pipeline:** Captures, transcribes, and parses audio in real-time  
- **API Layer:** FastAPI REST endpoints for patients, records, and transcription services  
- **Database:** Supabase stores user data, patient records, and query logs  
- **Integration:** LLM interprets voice commands to generate queries and actions  
- **External Services:** Supabase, OpenAI API, Eleven Labs API  

---

## 📸 Screenshot

![OperAid Screenshot](./data/Screenshot%20from%202025-09-28%2014-47-02.png)
