from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app import database
from app.routes import analyzer, history

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the SQLite database on startup
    try:
        database.init_db()
        print("SQLite Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing SQLite Database: {e}")
    yield
    # Cleanup on shutdown (if needed)

app = FastAPI(
    title="AI Resume Analyzer + Job Matcher API",
    description="Backend API for skill extraction, semantic matching, and suggestion generation.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for React dev server (usually 5173) and Electron requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local Desktop applications
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount APIRouters
app.include_router(analyzer.router)
app.include_router(history.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }

@app.get("/")
async def root():
    return {"message": "AI Resume Analyzer + Job Matcher API is running."}
