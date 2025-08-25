from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import crud, models, database
from app.api.v1.dependencies import get_current_company_from_user
from app.business_schemas import ApiKeyInfo, ApiKeyCreate, ContributionSearchResult, ContributionPreview, FullContribution
from typing import List

router = APIRouter(prefix="/business", tags=["Business Data"])

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
async def search_contributions(search_params: ContributionSearchResult, company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    # This is a placeholder for a more complex search implementation
    # In a real scenario, this would use keywords, filters, etc.
    results = crud.search_contributions(db, company_id=company.id, limit=search_params.limit)
    return results

@router.post("/data/unlock/{contribution_id}", response_model=FullContribution)
async def unlock_contribution(contribution_id: int, company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    unlocked_contribution = crud.unlock_contribution(db, company_id=company.id, contribution_id=contribution_id)
    return unlocked_contribution

@router.get("/data/contributions/{contribution_id}", response_model=FullContribution)
async def get_unlocked_contribution(contribution_id: int, company: models.Company = Depends(get_current_company_from_user), db: Session = Depends(database.get_db)):
    contribution = crud.get_unlocked_contribution_content(db, company_id=company.id, contribution_id=contribution_id)
    if not contribution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contribution not found or not unlocked.")
    return contribution