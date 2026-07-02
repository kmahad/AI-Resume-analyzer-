import os
import sqlite3
import json
from datetime import datetime

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "resume_analyzer.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create resumes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        extracted_text TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    
    # Create analyses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resume_id INTEGER NOT NULL,
        job_description TEXT NOT NULL,
        score REAL NOT NULL,
        result_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()

def save_resume(filename: str, extracted_text: str) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    
    cursor.execute(
        "INSERT INTO resumes (filename, extracted_text, created_at) VALUES (?, ?, ?)",
        (filename, extracted_text, created_at)
    )
    resume_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return resume_id

def save_analysis(resume_id: int, job_description: str, score: float, result_data: dict) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    result_json = json.dumps(result_data)
    
    cursor.execute(
        "INSERT INTO analyses (resume_id, job_description, score, result_json, created_at) VALUES (?, ?, ?, ?, ?)",
        (resume_id, job_description, score, result_json, created_at)
    )
    analysis_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return analysis_id

def get_all_analyses():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.id, a.resume_id, r.filename, a.job_description, a.score, a.result_json, a.created_at
        FROM analyses a
        JOIN resumes r ON a.resume_id = r.id
        ORDER BY a.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    analyses = []
    for row in rows:
        analyses.append({
            "id": row["id"],
            "resume_id": row["resume_id"],
            "filename": row["filename"],
            "job_description": row["job_description"],
            "score": row["score"],
            "result": json.loads(row["result_json"]),
            "created_at": row["created_at"]
        })
    return analyses

def get_analysis_by_id(analysis_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.id, a.resume_id, r.filename, r.extracted_text as resume_text, a.job_description, a.score, a.result_json, a.created_at
        FROM analyses a
        JOIN resumes r ON a.resume_id = r.id
        WHERE a.id = ?
    """, (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    return {
        "id": row["id"],
        "resume_id": row["resume_id"],
        "filename": row["filename"],
        "resume_text": row["resume_text"],
        "job_description": row["job_description"],
        "score": row["score"],
        "result": json.loads(row["result_json"]),
        "created_at": row["created_at"]
    }

def delete_analysis(analysis_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # We should delete the resume as well, or cascade delete.
    # To clean up fully, let's fetch the resume_id first, delete the analysis, and if no other analysis refers to the resume, delete the resume.
    cursor.execute("SELECT resume_id FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
        
    resume_id = row["resume_id"]
    
    # Delete the analysis (foreign key cascade deletes it if enabled, but let's delete manually to be safe)
    cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    
    # Check if this resume has any other analyses
    cursor.execute("SELECT COUNT(*) FROM analyses WHERE resume_id = ?", (resume_id,))
    count = cursor.fetchone()[0]
    if count == 0:
        cursor.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
        
    conn.commit()
    conn.close()
    return True
