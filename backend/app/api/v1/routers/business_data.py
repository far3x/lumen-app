from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db import crud, models, database
from app.api.v1.dependencies import get_current_company_from_user, get_current_business_user, get_current_admin_user, get_current_company_from_api_key
from app.business_schemas import (
    ApiKeyInfo, ApiKeyCreate, ContributionSearchResult, ContributionPreview, 
    FullContribution, DashboardStats, UsageDataPoint, UnlockedContributionDetail,
    TeamMember, InviteCreate, CompanyUpdate, BusinessUserUpdate, BusinessUser as BusinessUserSchema,
    Company as CompanySchema, ApiKeyUsageSummary
)
from app.tasks import send_team_invitation_email_task
from typing import List
from datetime import datetime, timedelta
import io

router = APIRouter(prefix="/business", tags=["Business Data"])

@router.get("/dashboard-stats", response_model=DashboardStats)
async def get_dashboard_stats(company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    return crud.get_dashboard_stats(db, company_id=company.id)

@router.get("/usage-stats", response_model=List[UsageDataPoint])
async def get_usage_stats(company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    start_date = datetime.utcnow() - timedelta(days=210) 
    return crud.get_usage_stats_by_day(db, company_id=company.id, start_date=start_date)

@router.get("/api-key-usage", response_model=List[ApiKeyUsageSummary])
async def get_api_key_usage(company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    start_date = datetime.utcnow() - timedelta(days=30)
    return crud.get_api_key_usage_summary(db, company_id=company.id, start_date=start_date)

@router.get("/data/unlocked", response_model=List[UnlockedContributionDetail])
async def get_unlocked_contributions(company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    return crud.get_recently_unlocked_contributions(db, company_id=company.id, limit=5)

@router.get("/team", response_model=List[TeamMember])
async def get_team_members(company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    return crud.get_team_members(db, company_id=company.id)

@router.post("/team/invite", status_code=status.HTTP_202_ACCEPTED)
async def invite_team_member(
    invite_data: InviteCreate,
    company: models.Company = Depends(get_current_company_from_user),
    admin_user: models.BusinessUser = Depends(get_current_admin_user),
    db: Session = Depends(database.get_db)
):
    existing_user_in_company = db.query(models.BusinessUser).filter(
        models.BusinessUser.email == invite_data.email,
        models.BusinessUser.company_id == company.id
    ).first()
    if existing_user_in_company:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This user is already a member of your team.")

    invitation = crud.create_team_invitation(db, company=company, email=invite_data.email)
    
    user_exists = crud.get_business_user_by_email(db, email=invite_data.email) is not None

    send_team_invitation_email_task.delay(
        invited_by_name=admin_user.full_name,
        company_name=company.name,
        invitee_email=invite_data.email,
        invite_token=invitation.token,
        user_exists=user_exists
    )

    return {"message": "Invitation sent successfully."}


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

@router.get("/data/languages", response_model=List[str])
async def get_contribution_languages(db: Session = Depends(database.get_db)):
    return crud.get_distinct_contribution_languages(db)

@router.post("/data/search", response_model=List[ContributionPreview])
async def search_contributions(
    search_params: ContributionSearchResult, 
    company: models.Company = Depends(get_current_company_from_user), 
    db: Session = Depends(database.get_db)
):
    if search_params.min_tokens is not None and search_params.max_tokens is not None and search_params.min_tokens > search_params.max_tokens:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="min_tokens cannot be greater than max_tokens")

    results = crud.search_contributions(
        db, 
        company_id=company.id, 
        limit=search_params.limit,
        keywords=search_params.keywords,
        languages=search_params.languages,
        min_tokens=search_params.min_tokens,
        max_tokens=search_params.max_tokens,
        min_clarity=search_params.min_clarity,
        min_arch=search_params.min_arch,
        min_quality=search_params.min_quality,
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
    company: models.Company = Depends(get_current_company_from_api_key),
    db: Session = Depends(database.get_db)
):
    contribution = crud.get_unlocked_contribution_content(db, company_id=company.id, contribution_id=contribution_id)
    if not contribution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contribution not found or not unlocked.")
    return contribution

@router.get("/data/download/{contribution_id}", response_class=StreamingResponse)
async def download_unlocked_contribution(
    contribution_id: int,
    company: models.Company = Depends(get_current_company_from_api_key),
    db: Session = Depends(database.get_db)
):
    contribution = crud.get_unlocked_contribution_content(db, company_id=company.id, contribution_id=contribution_id)
    if not contribution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contribution not found or not unlocked.")

    content_stream = io.StringIO(contribution.raw_content)
    
    return StreamingResponse(
        content_stream,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=lumen_contribution_{contribution_id}.txt"}
    )