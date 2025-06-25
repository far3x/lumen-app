from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db import crud, models, database
from app.api.v1 import dependencies
from app.services.solana_service import solana_service
from app.core.limiter import limiter

router = APIRouter(prefix="/rewards", tags=["Rewards"])

class ClaimResponse(BaseModel):
    message: str
    transaction_hash: str

@router.post("/claim", response_model=ClaimResponse)
@limiter.limit("1/day")
def claim_rewards(
    request: Request,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if not current_user.solana_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No Solana wallet is linked to your account. Please link a wallet in settings."
        )

    account = crud.get_account_details(db, user_id=current_user.id)
    if not account or account.lum_balance <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have no claimable rewards."
        )

    claimable_amount = account.lum_balance
    amount_lamports = int(claimable_amount * (10**9))

    try:
        tx_hash = solana_service.transfer_lum_tokens(
            recipient_address_str=current_user.solana_address,
            amount_lamports=amount_lamports
        )
        
        crud.reset_claimable_balance(db, user_id=current_user.id)
        crud.log_claim_transaction(
            db, 
            user_id=current_user.id, 
            amount=claimable_amount, 
            tx_hash=tx_hash
        )
        
        success_message = (
            f"Successfully claimed {claimable_amount:.4f} LUM. "
            "The transaction may take a moment to appear on Solscan."
        )
        return ClaimResponse(
            message=success_message,
            transaction_hash=tx_hash
        )

    except ValueError as e:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An on-chain error occurred during the claim process. Your balance has not been affected. Please try again later. Error: {e}"
        )