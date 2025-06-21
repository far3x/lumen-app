from fastapi import APIRouter, Depends, HTTPException, Query, status, Request, Response
from sqlalchemy.orm import Session
import json
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config as AuthlibConfig

from app.db import crud, models, database
from app.api.v1 import dependencies
from app.schemas import User as UserSchema, Account as AccountSchema, ContributionResponse, UserUpdate, ValuationMetrics, AiAnalysis, ChangePasswordRequest
from pydantic import BaseModel
from typing import List
from app.core import security, config
from app.core.limiter import limiter

class PaginatedContributions(BaseModel):
    items: List[ContributionResponse]
    total: int

router = APIRouter(prefix="/users", tags=["Users"])

authlib_config = AuthlibConfig('.env')
oauth = OAuth(authlib_config)
oauth.register( name='google', client_id=config.settings.GOOGLE_CLIENT_ID, client_secret=config.settings.GOOGLE_CLIENT_SECRET, server_metadata_url='https://accounts.google.com/.well-known/openid-configuration', client_kwargs={'scope': 'openid email profile'} )
oauth.register( name='github', client_id=config.settings.GITHUB_CLIENT_ID, client_secret=config.settings.GITHUB_CLIENT_SECRET, access_token_url='https://github.com/login/oauth/access_token', authorize_url='https://github.com/login/oauth/authorize', api_base_url='https://api.github.com/', client_kwargs={'scope': 'user:email'} )


@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@router.put("/me", response_model=UserSchema)
@limiter.limit("10/minute")
async def update_users_me(
    request: Request,
    user_update: UserUpdate,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    updated_user = crud.update_user_profile(db, current_user, user_update)
    return updated_user

@router.post("/me/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    if not current_user.hashed_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change password for accounts created with OAuth.")

    if not security.verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect current password.")
    
    current_user.hashed_password = security.get_password_hash(request.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Password updated successfully. Please log in again."}

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
        valuation_details_data = {}
        if contrib.valuation_results:
            try:
                valuation_details_data = json.loads(contrib.valuation_results) if isinstance(contrib.valuation_results, str) else contrib.valuation_results
                if not isinstance(valuation_details_data, dict):
                    valuation_details_data = {}
            except (json.JSONDecodeError, TypeError):
                valuation_details_data = {}
        
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

@router.get('/link-oauth/{provider}')
async def link_oauth_account(
    request: Request,
    provider: str,
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if provider not in ['google', 'github']:
        raise HTTPException(status_code=404, detail="Provider not found")

    request.session['oauth_link_user_id'] = current_user.id
    
    redirect_uri = request.url_for('auth_callback', provider=provider)
    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri)