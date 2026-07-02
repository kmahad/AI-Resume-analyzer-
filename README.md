# AI Resume Analyzer + Job Matcher

A premium, modern desktop application built to analyze candidate profiles (resumes) against job descriptions using advanced NLP, semantic embeddings, and statistical keyword matching.

## Features
- **Semantic Analysis:** Computes semantic similarity between resumes and job descriptions using SentenceTransformers (`all-MiniLM-L6-v2`) with a fast TF-IDF fallback.
- **Detailed Skill Mapping:** Extracts matched skills, missing skills, and overall resume skills using an expanded technology and soft skills taxonomy.
- **Interactive Visualizations:** Renders match gauges and visual skill gap charts.
- **Export Reports:** Standardized printing support for candidate-job matching reports.
- **Multi-Job Comparison:** Compare a single candidate profile against multiple job descriptions to find the best fit.
- **Analysis History:** Tracks, saves, and manages historical analyses in a local SQLite database.

## Architecture
- **Frontend:** React, Vite, and Vanilla CSS with premium glassmorphic styling.
- **Backend:** FastAPI, SQLite database, spaCy, and SentenceTransformers.
- **Desktop Wrapper:** Electron wrapper to run the app as a native desktop application.

## Getting Started

### 1. Backend Setup
```bash
cd backend
# Create virtual environment and install requirements
# Run the FastAPI server:
python -m uvicorn app.main:app --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Run Desktop App (Electron)
```bash
cd electron
npm install
npm start
```
