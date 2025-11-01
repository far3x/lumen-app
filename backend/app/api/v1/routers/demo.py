from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
from pathlib import Path
import json
from celery.result import AsyncResult

from app.db import database
from app.core.limiter import limiter
from app.api.v1.routers.public import get_visitor_id_key
from app.tasks import analyze_demo_project_task
from app.services.redis_service import redis_service

router = APIRouter(prefix="/demo", tags=["Demo"])

DEMO_BASE_PATH = Path(__file__).parent.parent.parent.parent / "demo"

DEMO_PROJECTS = {
    "lumen-app": {
        "display_name": "Lumen App",
        "folder": "lumen-app",
        "description": "The Lumen Protocol full-stack application."
    },
    "java-app": {
        "display_name": "Java Full-Stack App",
        "folder": "java-app",
        "description": "A complete Java application with a PostgreSQL backend."
    },
    "intelligent-parking": {
        "display_name": "Intelligent Parking System",
        "folder": "intelligent-parking",
        "description": "A full-stack project to control a robotic parking system."
    }
}

class AnalyzeRequest(BaseModel):
    project_id: str = "lumen-app"

def _load_project_as_codebase(root_path: Path) -> str:
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

@router.get("/projects")
def get_demo_projects():
    return {
        "projects": [
            {
                "id": project_id,
                "display_name": info["display_name"],
                "description": info["description"]
            }
            for project_id, info in DEMO_PROJECTS.items()
        ]
    }

@router.post("/analyze")
@limiter.limit("10/minute", key_func=get_visitor_id_key)
def analyze_demo_project(
    request: Request,
    analyze_request: AnalyzeRequest,
    db: Session = Depends(database.get_db)
):
    project_id = analyze_request.project_id
    
    if project_id not in DEMO_PROJECTS:
        raise HTTPException(status_code=400, detail=f"Project '{project_id}' not found. Available projects: {list(DEMO_PROJECTS.keys())}")
    
    cache_key = f"cache:demo_analysis:{project_id}"
    cached_result = redis_service.get(cache_key)
    
    if cached_result:
        return JSONResponse(content=json.loads(cached_result))
    
    project_info = DEMO_PROJECTS[project_id]
    project_path = DEMO_BASE_PATH / project_info["folder"]
    
    if not project_path.exists() or not any(project_path.iterdir()):
        raise HTTPException(status_code=503, detail=f"Demo project '{project_id}' is not configured on the server.")

    codebase = _load_project_as_codebase(project_path)
    
    if not codebase:
        raise HTTPException(status_code=500, detail="Failed to load demo project content.")
        
    task_result = analyze_demo_project_task.delay(codebase)
    
    try:
        result = task_result.get(timeout=90)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        redis_service.set_with_ttl(cache_key, json.dumps(result), 300)
        
        return result
    except Exception as e:
        task_result.forget()
        raise HTTPException(status_code=500, detail=f"Analysis task failed or timed out: {str(e)}")