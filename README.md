<<<<<<< HEAD
# ReportSaathi (रिपोर्ट साथी)
### *Simplifying Medical Laboratory Reports into Everyday Language for Educational Empowerment*

ReportSaathi is a full-stack health literacy web application designed to help patients and caregivers understand complex laboratory results (PDFs and mobile photos) in plain, empathetic, jargon-free language.

---

## 🌟 Key Features

1. **Document & Photo OCR**: Upload laboratory reports as PDFs or camera snapshots (PNG, JPG, WEBP). Preprocessed with contrast enhancement and extracted via Tesseract OCR.
2. **AI-Powered Simplification**: Leverages the Google Gemini API to translate complex biomarker data into plain English.
3. **Doctor Consultation Prep**: Generates a categorized checklist of thoughtful questions to bring to your next physician visit.
4. **Jargon-Free Glossary**: Translates diagnostic acronyms (e.g. HbA1c, SGPT/ALT, eGFR) into accessible everyday analogies.
5. **Patient Privacy by Design**: Automatically redacts Personally Identifiable Information (Patient Names, Phone Numbers, MRN/UHID) before sending text to the AI model.
6. **Graceful Guest Mode & Supabase**: Works instantly without mandatory sign-in, with optional Supabase integration for saving history and managing accounts.

---

## ⚠️ Medical Disclaimer
> **ReportSaathi is for educational purposes only.** It does not provide medical diagnoses, clinical advice, or treatment plans. Always consult a qualified healthcare provider regarding your laboratory results.

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI & OCR)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup (React + Vite + Tailwind CSS)
```powershell
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.
=======
# reportsaathi_workshop_project_
>>>>>>> 5f2932104ab6716a714f634c00a67ca89f02a961
