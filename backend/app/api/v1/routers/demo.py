from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import os
from pathlib import Path
import json
from celery.result import AsyncResult

from app.db import database
from app.core.limiter import limiter
from app.api.v1.routers.public import get_visitor_id_key
from app.tasks import analyze_demo_project_task

router = APIRouter(prefix="/demo", tags=["Demo"])

DEMO_PROJECT_PATH = Path(__file__).parent.parent.parent.parent / "demo"

def _load_project_as_codebase(root_path: Path) -> str:
    """Walks a directory and builds a single string in the Lumen codebase format."""
    codebase_parts = []
    
    exclude_dirs = {'.git', '__pycache__', 'node_modules', '.vscode', 'dist', 'build'}
    exclude_files = {'.DS_Store', 'package-lock.json', 'yarn.lock'}

    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file_name in files:
            if file_name in exclude_files:
                continue

            file_path = Path(root) / file_name
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                relative_path = file_path.relative_to(root_path)
                
                codebase_parts.append(f"---lum--new--file--{relative_path.as_posix()}\n{content}")
            except Exception:
                pass
                
    return "".join(codebase_parts)

@router.post("/analyze")
@limiter.limit("10/hour", key_func=get_visitor_id_key)
def analyze_demo_project(request: Request, db: Session = Depends(database.get_db)):
    """
    Analyzes a pre-defined demo project using a background task.
    This is a public, rate-limited endpoint for demonstration purposes.
    It does NOT create any database records.
    """
    if not DEMO_PROJECT_PATH.exists() or not any(DEMO_PROJECT_PATH.iterdir()):
        raise HTTPException(status_code=503, detail="Demo project is not configured on the server.")

    codebase = _load_project_as_codebase(DEMO_PROJECT_PATH)
    
    if not codebase:
        raise HTTPException(status_code=500, detail="Failed to load demo project content.")
        
    task_result = analyze_demo_project_task.delay(codebase)
    
    try:
        # Wait up to 90 seconds for the full analysis to complete
        result = task_result.get(timeout=90)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        task_result.forget()
        raise HTTPException(status_code=500, detail=f"Analysis task failed or timed out: {str(e)}")