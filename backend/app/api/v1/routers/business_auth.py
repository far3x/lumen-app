from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db import crud, models, database
from app.core import security, config
from app.business_schemas import BusinessUserCreate, BusinessToken, BusinessUser as BusinessUserSchema, Company as CompanySchema
from app.core.limiter import limiter

router = APIRouter(prefix="/business", tags=["Business Authentication"])

@router.post("/register", response_model=BusinessToken, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def register_business_user(request: Request, user_data: BusinessUserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_business_user_by_email(db, email=user_data.email)
    if db_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    company = crud.get_company_by_name(db, name=user_data.company_name)
    if company and not company.users:
        pass
    elif company and company.users:
        raise HTTPException(status_code=400, detail="A company with this name already exists. Please contact support if you need to be added to the team.")

    new_user = crud.create_business_user(db, user_data=user_data)
    
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(new_user.id), "type": "business"}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": BusinessUserSchema.from_orm(new_user),
        "company": CompanySchema.from_orm(new_user.company)
    }

@router.post("/login", response_model=BusinessToken)
@limiter.limit("10/minute")
async def login_business_user(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_business_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id), "type": "business"}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": BusinessUserSchema.from_orm(user),
        "company": CompanySchema.from_orm(user.company)
    }