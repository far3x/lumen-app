from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import json

from app.db import crud, models, database
from app.api.v1 import dependencies
from app.schemas import User as UserSchema, Account as AccountSchema, ContributionResponse, UserUpdate, ValuationMetrics, AiAnalysis
from pydantic import BaseModel
from typing import List

class PaginatedContributions(BaseModel):
    items: List[ContributionResponse]
    total: int

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_users_me(
    user_update: UserUpdate,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    updated_user = crud.update_user_profile(db, current_user, user_update)
    return updated_user

@router.get("/me/balance", response_model=AccountSchema)
def get_my_balance(
    current_user: models.User = Depends(dependencies.get_current_user), 
    db: Session = Depends(database.get_db)
):
    account = crud.get_account(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.get("/me/contributions", response_model=PaginatedContributions)
def get_my_contributions(
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100)
):
    contributions, total_count = crud.get_user_contributions_paginated(db, user_id=current_user.id, skip=skip, limit=limit)
    
    response_list = []
    for contrib in contributions:
        valuation_details_data = json.loads(contrib.valuation_results) if contrib.valuation_results else {}
        
        manual_metrics = ValuationMetrics(
            total_lloc=valuation_details_data.get('total_lloc', 0),
            total_tokens=valuation_details_data.get('total_tokens', 0),
            avg_complexity=valuation_details_data.get('avg_complexity', 0.0),
            compression_ratio=valuation_details_data.get('compression_ratio', 0.0),
            language_breakdown=valuation_details_data.get('language_breakdown', {})
        )
        
        ai_analysis = AiAnalysis(
            project_clarity_score=valuation_details_data.get('project_clarity_score', 0.0),
            architectural_quality_score=valuation_details_data.get('architectural_quality_score', 0.0),
            code_quality_score=valuation_details_data.get('code_quality_score', 0.0),
            analysis_summary=valuation_details_data.get('analysis_summary')
        )

        response_list.append(ContributionResponse(
            id=contrib.id,
            created_at=contrib.created_at,
            reward_amount=contrib.reward_amount,
            status=contrib.status,
            valuation_details=valuation_details_data,
            manual_metrics=manual_metrics,
            ai_analysis=ai_analysis
        ))
    
    return PaginatedContributions(items=response_list, total=total_count)