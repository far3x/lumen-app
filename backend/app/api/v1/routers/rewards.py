from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.db import crud, models, database
from app.api.v1 import dependencies
from app.core.limiter import limiter
from app.tasks import process_claim
from app.schemas import ClaimRequestResponse

router = APIRouter(prefix="/rewards", tags=["Rewards"])

@router.post("/claim", response_model=ClaimRequestResponse, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("1/day")
def claim_rewards(
    request: Request,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.verify_beta_access)
):
    if current_user.cooldown_until and datetime.now(timezone.utc) < current_user.cooldown_until:
        remaining_time = current_user.cooldown_until - datetime.now(timezone.utc)
        days, seconds = remaining_time.days, remaining_time.seconds
        hours = seconds // 3600
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"New accounts must wait before claiming. You can claim in {days} days and {hours} hours."
        )

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
    
    claim_record = crud.log_claim_transaction(
        db, 
        user_id=current_user.id, 
        amount=account.lum_balance, 
        tx_hash="PENDING"
    )

    process_claim.delay(current_user.id, claim_record.id)

    return ClaimRequestResponse(
        message="Your claim request has been received and is being processed. You will be notified upon completion.",
        claim_id=claim_record.id
    )