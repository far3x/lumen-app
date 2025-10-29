from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
import nacl.exceptions
from solders.pubkey import Pubkey
from nacl.signing import VerifyKey

from app.db import crud, models, database
from app.api.v1 import dependencies
from app.schemas import AirdropCheckRequest, AirdropStatusResponse, AirdropClaimRequest
from app.core import security, config
from app.services.solana_service import solana_service
from app.core.limiter import limiter
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/airdrop", tags=["Airdrop"])

@router.post("/check", response_model=AirdropStatusResponse)
@limiter.limit("10/minute")
async def check_airdrop_eligibility(
    request: Request,
    payload: AirdropCheckRequest,
    db: Session = Depends(database.get_db)
):
    try:
        pubkey = Pubkey.from_string(payload.solana_address)
        signature_bytes = bytes.fromhex(payload.signature)
        message_bytes = payload.message.encode('utf-8')
        verify_key = VerifyKey(bytes(pubkey))
        verify_key.verify(message_bytes, signature_bytes)
    except (nacl.exceptions.BadSignatureError, ValueError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signature verification failed.")

    recipient = db.query(models.AirdropRecipient).filter(models.AirdropRecipient.solana_address == payload.solana_address).first()

    if not recipient:
        return AirdropStatusResponse(is_eligible=False, has_claimed=False)

    original_amount = float(recipient.token_amount)
    claimable_amount = original_amount * 0.70

    if recipient.has_claimed:
        return AirdropStatusResponse(is_eligible=True, has_claimed=True, original_token_amount=original_amount, token_amount=claimable_amount)

    expires = timedelta(minutes=10)
    claim_token = security.create_access_token(
        data={"sub": f"airdrop_claim:{recipient.solana_address}"},
        expires_delta=expires
    )

    return AirdropStatusResponse(
        is_eligible=True,
        has_claimed=False,
        original_token_amount=original_amount,
        token_amount=claimable_amount,
        claim_token=claim_token
    )

@router.post("/claim")
@limiter.limit("3/hour")
async def claim_airdrop(
    request: Request,
    payload: AirdropClaimRequest,
    db: Session = Depends(database.get_db)
):
    try:
        token_payload = security.jwt.decode(payload.claim_token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        subject = token_payload.get("sub")
        if not subject or not subject.startswith("airdrop_claim:"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid claim token type.")
        
        solana_address = subject.split("airdrop_claim:")[1]

    except security.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired claim token.")

    recipient = db.query(models.AirdropRecipient).filter(models.AirdropRecipient.solana_address == solana_address).with_for_update().first()

    if not recipient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Airdrop recipient not found.")
    
    if recipient.has_claimed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Airdrop has already been claimed for this address.")

    try:
        claimable_amount = float(recipient.token_amount) * 0.70

        tx_hash = solana_service.airdrop_lumen_tokens(
            recipient_address_str=solana_address,
            amount_tokens=claimable_amount
        )

        recipient.has_claimed = True
        recipient.solana_transaction_hash = tx_hash
        recipient.claimed_at = datetime.now(timezone.utc)
        db.commit()

        return {"transaction_hash": tx_hash}
    except ValueError as e:
        db.rollback()
        logger.error(f"Airdrop claim failed due to a value error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        logger.error(f"An unexpected error occurred during airdrop claim: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to process claim: An unexpected server error occurred."
        )