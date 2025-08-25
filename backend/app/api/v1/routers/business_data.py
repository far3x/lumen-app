from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import crud, models, database
from app.api.v1.dependencies import get_current_company_from_user, get_current_business_user, get_current_admin_user, get_current_company_from_api_key
from app.business_schemas import (
    ApiKeyInfo, ApiKeyCreate, ContributionSearchResult, ContributionPreview, 
    FullContribution, DashboardStats, UsageDataPoint, UnlockedContributionDetail,
    TeamMember, InviteCreate, CompanyUpdate, BusinessUserUpdate, BusinessUser as BusinessUserSchema,
    Company as CompanySchema
)
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/business", tags=["Business Data"])

@router.get("/dashboard-stats", response_model=DashboardStats)
async def get_dashboard_stats(company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    return crud.get_dashboard_stats(db, company_id=company.id)

@router.get("/usage-stats", response_model=List[UsageDataPoint])
async def get_usage_stats(company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    start_date = datetime.utcnow() - timedelta(days=210) # Approx 7 months
    return crud.get_usage_stats_by_day(db, company_id=company.id, start_date=start_date)

@router.get("/data/unlocked", response_model=List[UnlockedContributionDetail])
async def get_unlocked_contributions(company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    return crud.get_recently_unlocked_contributions(db, company_id=company.id, limit=5)

@router.get("/team", response_model=List[TeamMember])
async def get_team_members(company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    return crud.get_team_members(db, company_id=company.id)

@router.post("/team/invite", response_model=TeamMember, status_code=status.HTTP_201_CREATED)
async def invite_team_member(
    invite_data: InviteCreate,
    company: models.Company = Depends(get_current_company_from_user),
    admin_user: models.BusinessUser = Depends(get_current_admin_user),
    db: Session = Depends(database.get_db)
):
    if crud.get_business_user_by_email(db, email=invite_data.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this email already exists.")
    
    new_user = crud.create_invited_business_user(db, invite_data=invite_data, company=company)
    # In a real scenario, you'd trigger a password setup email here.
    return new_user

@router.delete("/team/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_team_member(
    user_id: int,
    company: models.Company = Depends(get_current_company_from_user),
    admin_user: models.BusinessUser = Depends(get_current_admin_user),
    db: Session = Depends(database.get_db)
):
    if user_id == admin_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot remove themselves.")
    
    crud.remove_team_member(db, user_id=user_id, company_id=company.id)
    return

@router.put("/company", response_model=CompanySchema)
async def update_company_profile(
    company_data: CompanyUpdate,
    company: models.Company = Depends(get_current_company_from_user),
    admin_user: models.BusinessUser = Depends(get_current_admin_user),
    db: Session = Depends(database.get_db)
):
    return crud.update_company_profile(db, company=company, company_data=company_data)

@router.put("/users/me", response_model=BusinessUserSchema)
async def update_business_user_profile(
    user_data: BusinessUserUpdate,
    current_user: models.BusinessUser = Depends(get_current_business_user),
    db: Session = Depends(database.get_db)
):
    return crud.update_business_user_profile(db, user=current_user, user_data=user_data)

# API Key Management
@router.get("/api-keys", response_model=List[ApiKeyInfo])
async def get_api_keys(company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    return crud.get_api_keys_for_company(db, company_id=company.id)

@router.post("/api-keys", response_model=ApiKeyCreate)
async def create_api_key(key_data: ApiKeyCreate, company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    raw_key = crud.create_api_key(db, company=company, name=key_data.name)
    return {"name": key_data.name, "key": raw_key}

@router.delete("/api-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(key_id: int, company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    crud.revoke_api_key(db, key_id=key_id, company_id=company.id)
    return

# Data Explorer & Access
@router.post("/data/search", response_model=List[ContributionPreview])
async def search_contributions(
    search_params: ContributionSearchResult, 
    company: models.Company = Depends(get_current_company_from_user), 
    db: Session = Depends(database.get_db)
):
    results = crud.search_contributions(
        db, 
        company_id=company.id, 
        limit=search_params.limit,
        keywords=search_params.keywords,
        min_clarity=search_params.min_clarity,
        min_arch=search_params.min_arch,
        min_quality=search_params.min_quality,
        languages=search_params.languages
    )
    return results

@router.post("/data/unlock/{contribution_id}", response_model=FullContribution)
async def unlock_contribution(
    contribution_id: int, 
    company: models.Company = Depends(get_current_company_from_user), 
    api_key: models.ApiKey = Depends(get_current_company_from_api_key),
    db: Session = Depends(database.get_db)
):
    unlocked_contribution = crud.unlock_contribution(
        db, company_id=company.id, 
        contribution_id=contribution_id, 
        api_key_id=api_key.id
    )
    return unlocked_contribution

@router.get("/data/contributions/{contribution_id}", response_model=FullContribution)
async def get_unlocked_contribution(
    contribution_id: int, 
    company: models.Company = Depends(get_current_company_from_user), 
    api_key: models.ApiKey = Depends(get_current_company_from_api_key),
    db: Session = Depends(database.get_db)
):
    contribution = crud.get_unlocked_contribution_content(db, company_id=company.id, contribution_id=contribution_id)
    if not contribution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contribution not found or not unlocked.")
    return contribution