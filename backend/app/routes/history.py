from fastapi import APIRouter, HTTPException
from app import database

router = APIRouter(prefix="/api/history", tags=["history"])

@router.get("")
async def get_history():
    try:
        history = database.get_all_analyses()
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: int):
    try:
        analysis = database.get_analysis_by_id(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return analysis
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")


@router.delete("/{analysis_id}")
async def delete_analysis(analysis_id: int):
    try:
        success = database.delete_analysis(analysis_id)
        if not success:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return {"status": "success", "message": f"Analysis {analysis_id} deleted."}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(e)}")
