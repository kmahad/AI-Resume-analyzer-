import os
import sys
import io

# Force UTF-8 output on Windows to avoid UnicodeEncodeError with emoji
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

def test_imports():
    print("--- Test 1: Module Imports ---")
    try:
        from app.services import parser, nlp_engine
        from app import database
        print("Success: All backend modules imported correctly.")
        return True
    except Exception as e:
        print(f"Failed: Module imports failed. Error: {e}")
        return False

def test_database_init():
    print("\n--- Test 2: Database Initialization ---")
    try:
        from app import database
        database.init_db()
        print(f"Success: Database schema initialized at: {database.DB_PATH}")
        if os.path.exists(database.DB_PATH):
            print("Verified: database file exists.")
            return True
        else:
            print("Failed: Database file was not created.")
            return False
    except Exception as e:
        print(f"Failed: Database initialization failed. Error: {e}")
        return False

def test_text_parser():
    print("\n--- Test 3: Text Parser Utility ---")
    try:
        from app.services import parser
        test_txt = "Resume details: John Doe, Python engineer."
        # Test plain text parsing
        parsed = parser.extract_text(test_txt.encode("utf-8"), "resume.txt")
        print(f"Plain text parsing check: '{parsed}'")
        assert parsed == test_txt, "Extracted text does not match input"
        print("Success: Text parser functions correctly.")
        return True
    except Exception as e:
        print(f"Failed: Text parser failed. Error: {e}")
        return False

def test_nlp_engine():
    print("\n--- Test 4: NLP Matching Engine ---")
    try:
        from app.services import nlp_engine
        
        dummy_resume = """
        John Doe
        Software Engineer
        Experience:
        - 5 years of experience building web applications.
        - Designed and developed microservices with Python and FastAPI.
        - Engineered frontend user interfaces using React and Redux.
        - Handled cloud deployments on AWS.
        Education:
        - Bachelor in Computer Science from Stanford University.
        """
        
        dummy_jd = """
        We are looking for a Senior Software Engineer with 5+ years of experience.
        Required Skills: Python, FastAPI, React, Docker, Kubernetes, AWS.
        Must have a Bachelor degree in Computer Science or equivalent.
        """
        
        # Instantiate test run
        print("Running analysis engine...")
        result = nlp_engine.engine.analyze(dummy_resume, dummy_jd)
        
        print("\nAnalysis Result Details:")
        print(f"Match Score: {result['match_score']}%")
        print(f"Semantic Similarity Score: {result['semantic_score']}%")
        print(f"Skill Match Score: {result['skill_score']}%")
        print(f"Keyword Match Score: {result['keyword_score']}%")
        print(f"Matched Skills: {result['matched_skills']}")
        print(f"Missing Skills: {result['missing_skills']}")
        print(f"Experience Years Pattern Matches: {result['experience_years']}")
        print(f"Education Matches: {result['education']}")
        print(f"Suggestions: {result['suggestions']}")
        
        # Verify schema elements
        expected_keys = [
            "match_score", "semantic_score", "skill_score", "keyword_score",
            "matched_skills", "missing_skills", "resume_skills", "experience_years", "education",
            "suggestions"
        ]
        
        for key in expected_keys:
            assert key in result, f"Schema error: missing key '{key}' in result."
            
        # Verify range
        assert 0.0 <= result["match_score"] <= 100.0, "Match score out of bounds."
        
        # Check specific skill extractions
        assert "Python" in result["matched_skills"], "Python should be matched"
        assert "React" in result["matched_skills"], "React should be matched"
        assert "FastAPI" in result["matched_skills"], "FastAPI should be matched"
        assert "Docker" in result["missing_skills"], "Docker should be missing"
        assert "Kubernetes" in result["missing_skills"], "Kubernetes should be missing"
        
        print("\nSuccess: NLP Engine output format and accuracy verified successfully.")
        return True
    except Exception as e:
        print(f"Failed: NLP Engine validation failed. Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("========================================")
    print("Starting AI Resume Analyzer Test Suite")
    print("========================================")
    
    success = True
    success = success and test_imports()
    success = success and test_database_init()
    success = success and test_text_parser()
    success = success and test_nlp_engine()
    
    print("========================================")
    if success:
        print("ALL TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("TEST RUN FAILED!")
        sys.exit(1)
