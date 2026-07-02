import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services import parser, nlp_engine
from app import database

router = APIRouter(prefix="/api/analyzer", tags=["analyzer"])

@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # Extract text from file
        try:
            resume_text = parser.extract_text(file_bytes, file.filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to extract text: {str(e)}")
            
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="The uploaded file contains no readable text.")
            
        # Run NLP Analysis
        analysis_result = nlp_engine.engine.analyze(resume_text, job_description)
        
        # Save to database
        try:
            resume_id = database.save_resume(file.filename, resume_text)
            analysis_id = database.save_analysis(
                resume_id=resume_id,
                job_description=job_description,
                score=analysis_result["match_score"],
                result_data=analysis_result
            )
            # Add database IDs to response
            analysis_result["resume_id"] = resume_id
            analysis_result["analysis_id"] = analysis_id
            analysis_result["filename"] = file.filename
        except Exception as db_err:
            print(f"Database error during save: {db_err}")
            # We still return the analysis result even if db save fails, but with db fields set to null
            analysis_result["resume_id"] = None
            analysis_result["analysis_id"] = None
            analysis_result["filename"] = file.filename

        return analysis_result
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@router.post("/analyze-multiple")
async def analyze_multiple_jobs(
    file: UploadFile = File(...),
    job_descriptions_json: str = Form(...) # JSON array of job description strings
):
    try:
        # Load and validate job descriptions
        try:
            job_descriptions = json.loads(job_descriptions_json)
            if not isinstance(job_descriptions, list):
                raise ValueError("Job descriptions must be a list")
        except Exception as json_err:
            raise HTTPException(status_code=400, detail=f"Invalid job descriptions JSON: {str(json_err)}")
            
        if not job_descriptions:
            raise HTTPException(status_code=400, detail="Please provide at least one job description.")
            
        # Read file bytes
        file_bytes = await file.read()
        
        # Extract text
        try:
            resume_text = parser.extract_text(file_bytes, file.filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to extract text: {str(e)}")
            
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="The uploaded file contains no readable text.")
            
        # Save resume once
        try:
            resume_id = database.save_resume(file.filename, resume_text)
        except Exception as db_err:
            print(f"Database error saving resume: {db_err}")
            resume_id = None
            
        # Analyze against each job description
        results = []
        for index, jd in enumerate(job_descriptions):
            analysis_result = nlp_engine.engine.analyze(resume_text, jd)
            
            if resume_id:
                try:
                    analysis_id = database.save_analysis(
                        resume_id=resume_id,
                        job_description=jd,
                        score=analysis_result["match_score"],
                        result_data=analysis_result
                    )
                    analysis_result["analysis_id"] = analysis_id
                except Exception as db_err:
                    print(f"Database error saving analysis {index}: {db_err}")
                    analysis_result["analysis_id"] = None
            else:
                analysis_result["analysis_id"] = None
                
            analysis_result["resume_id"] = resume_id
            analysis_result["filename"] = file.filename
            analysis_result["job_description_index"] = index
            results.append(analysis_result)
            
        return {
            "filename": file.filename,
            "resume_id": resume_id,
            "comparisons": results
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
