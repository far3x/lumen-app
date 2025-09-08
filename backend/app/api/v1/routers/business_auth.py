from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import jwt, JWTError

from app.db import crud, database
from app.core import security, config
from app.business_schemas import BusinessUserCreate, BusinessToken, BusinessUser as BusinessUserSchema, Company as CompanySchema
from app.core.limiter import limiter
from app.api.v1.routers.auth import verify_recaptcha
from app.tasks import send_business_verification_email_task

router = APIRouter(prefix="/business", tags=["Business Authentication"])

@router.post("/register", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("10/day")
async def register_business_user(request: Request, user_data: BusinessUserCreate, db: Session = Depends(database.get_db)):
    await verify_recaptcha(user_data.recaptcha_token)

    db_user = crud.get_business_user_by_email(db, email=user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists."
        )

    new_user = crud.create_business_user(db, user_data=user_data)
    
    send_business_verification_email_task.delay(
        email=new_user.email,
        token=new_user.verification_token
    )
    
    return {"message": "Verification email has been sent. Please check your inbox to activate your account."}

@router.post("/login", response_model=BusinessToken)
@limiter.limit("20/hour")
async def login_business_user(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_business_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified. Please check your inbox.")
    
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

@router.get("/verify-email")
@limiter.limit("10/hour")
async def verify_business_email(request: Request, token: str, db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        subject = payload.get("sub")
        if not subject or not subject.startswith("verify_business:"):
            raise HTTPException(status_code=400, detail="Invalid token type.")
        
        email = subject.split("verify_business:")[1]
        user = crud.get_business_user_by_email(db, email=email)

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        if user.is_verified:
            return {"message": "Account already verified."}
        if user.verification_token != token:
            raise HTTPException(status_code=400, detail="Invalid verification token.")

        user.is_verified = True
        user.verification_token = None
        db.add(user)
        db.commit()

        return {"message": "Email verified successfully."}

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")