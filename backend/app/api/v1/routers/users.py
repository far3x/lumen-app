from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import crud, models, database
from app.api.v1 import dependencies
from app.schemas import User as UserSchema, Account as AccountSchema

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@router.get("/me/balance", response_model=AccountSchema)
def get_my_balance(
    current_user: models.User = Depends(dependencies.get_current_user), 
    db: Session = Depends(database.get_db)
):
    account = crud.get_account(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account