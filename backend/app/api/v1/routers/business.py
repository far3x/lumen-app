from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db import crud, database, models
from app.schemas import ContactSalesCreate
from app.business_schemas import ChargeRequest
from app.tasks import send_contact_sales_email_task
from app.core.limiter import limiter
from app.api.v1 import dependencies
from app.core import config, security
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import httpx
import math
import json
import asyncio
from app.services.solana_service import solana_service
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/business", tags=["Business"])

@router.post("/contact-sales", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def handle_contact_sales(
    request: Request,
    payload: ContactSalesCreate,
    db: Session = Depends(database.get_db)
):
    try:
        crud.create_contact_submission(db, submission=payload)
        send_contact_sales_email_task.delay(name=payload.full_name, email=payload.work_email)
        return {"message": "Submission successful. Thank you for contacting us."}
    except Exception as e:
        print(f"Error in contact sales endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="There was an issue processing your request."
        )

@router.post("/billing/charge")
async def create_charge(
    request: Request,
    payload: ChargeRequest,
    db: Session = Depends(database.get_db),
    current_user: models.BusinessUser = Depends(dependencies.get_current_business_user),
    x_payment_signature: Optional[str] = Header(None, alias="X-Payment-Signature"),
):
    logger.info("--- /billing/charge endpoint hit ---")
    logger.info(f"Received X-Payment-Signature header: {x_payment_signature}")

    if x_payment_signature:
        logger.info("Handling as a PAYMENT VERIFICATION request.")
        tx_signature = x_payment_signature
        logger.info(f"Extracted transaction signature for verification: {tx_signature}")
        
        if not payload.payment_data_token:
            logger.error("Payment data token is missing for verification.")
            raise HTTPException(status_code=400, detail="Payment data token is missing for verification.")

        try:
            data_payload = jwt.decode(payload.payment_data_token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
            token_user_id = int(data_payload.get("sub"))
            usd_amount_from_token = float(data_payload.get("amount"))
            logger.info(f"Decoded payment_data_token for user {token_user_id} and amount ${usd_amount_from_token}")
        except (JWTError, ValueError, TypeError) as e:
            logger.error(f"Invalid payment data token: {e}")
            raise HTTPException(status_code=400, detail="Invalid or expired payment data token.")
        
        if token_user_id != current_user.id:
            logger.error(f"Token user ID ({token_user_id}) does not match current user ID ({current_user.id}).")
            raise HTTPException(status_code=403, detail="Token does not match current user.")
        
        max_retries = 12
        retry_interval_seconds = 5
        tx_details = None

        logger.info(f"Starting blockchain verification for signature: {tx_signature}")
        for attempt in range(max_retries):
            logger.info(f"Verification attempt {attempt + 1}/{max_retries}...")
            tx_details = solana_service.get_transaction_details(tx_signature)
            if tx_details:
                logger.info(f"Transaction details found: {tx_details}")
                break
            logger.info(f"Transaction not yet confirmed. Waiting {retry_interval_seconds}s...")
            await asyncio.sleep(retry_interval_seconds)

        if not tx_details:
            logger.error("Transaction confirmation timed out after all retries.")
            raise HTTPException(status_code=408, detail="Transaction confirmation timed out. Please check your wallet for transaction status.")
        
        expected_amount_raw = int(usd_amount_from_token * 1_000_000)
        logger.info(f"Verifying transaction details. Expected amount (raw): {expected_amount_raw}, Expected recipient: {config.settings.MERCHANT_WALLET_ADDRESS}")
        
        if (
            tx_details.get("to") == config.settings.MERCHANT_WALLET_ADDRESS and
            tx_details.get("mint") == config.settings.USDC_TOKEN_MINT_ADDRESS and
            abs(tx_details.get("amount_raw", 0) - expected_amount_raw) <= 1
        ):
            logger.info("Transaction details MATCH. Crediting user account.")
            company = current_user.company
            TOKENS_PER_USD = 10000
            tokens_to_credit = int(usd_amount_from_token * TOKENS_PER_USD)
            if company.plan == 'free': company.plan = 'researcher'
            company.token_balance += tokens_to_credit
            
            billing_record = models.BillingHistory(
                company_id=company.id, 
                description=f"Token Purchase: +{tokens_to_credit:,} Tokens",
                amount_usd=usd_amount_from_token, 
                status="paid",
                invoice_url=f"https://solscan.io/tx/{tx_signature}"
            )
            db.add(company)
            db.add(billing_record)
            db.commit()
            logger.info(f"Successfully credited {tokens_to_credit} tokens to company {company.id}.")

            return {"message": "Payment successful", "tokens_credited": tokens_to_credit}
        else:
            logger.error(f"Transaction details MISMATCH. Details found: {tx_details}")
            raise HTTPException(status_code=400, detail="Transaction details mismatch. Payment could not be verified.")

    # This part is for the initial request to get payment info
    logger.info("Handling as an INITIAL CHARGE request. Returning 402.")
    data_to_encode = {
        "sub": str(current_user.id), "amount": payload.usd_amount,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
    }
    encoded_data = jwt.encode(data_to_encode, config.settings.SECRET_KEY, algorithm=config.settings.ALGORITHM)

    usdc_micro_units = int(payload.usd_amount * 1_000_000)
    
    base_url = str(request.base_url).rstrip('/')
    resource_url = f"{base_url}{request.url.path}"
    
    x402_response = {
        "x402Version": 1,
        "error": "Payment required",
        "accepts": [{
            "scheme": "exact",
            "network": "solana",
            "maxAmountRequired": str(usdc_micro_units),
            "asset": config.settings.USDC_TOKEN_MINT_ADDRESS,
            "payTo": config.settings.MERCHANT_WALLET_ADDRESS,
            "resource": resource_url,
            "description": f"Token purchase: ${payload.usd_amount:.2f} USD",
            "mimeType": "application/json",
            "maxTimeoutSeconds": 900,
            "data": encoded_data
        }]
    }
    
    return JSONResponse(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        content=x402_response,
        headers={"Content-Type": "application/json"}
    )