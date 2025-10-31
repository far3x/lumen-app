from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db import crud, database, models
from app.schemas import ContactSalesCreate
from app.business_schemas import ChargeRequest, VerifyPaymentRequest
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
    current_user: models.BusinessUser = Depends(dependencies.get_current_business_user)
):
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

@router.post("/billing/verify-payment")
async def verify_payment(
    payload: VerifyPaymentRequest,
    db: Session = Depends(database.get_db)
):
    try:
        data_payload = jwt.decode(payload.data, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        user_id = int(data_payload.get("sub"))
        usd_amount_from_token = float(data_payload.get("amount"))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid or expired data token.")

    user = crud.get_business_user_by_id(db, user_id)
    if not user or not user.company:
        raise HTTPException(status_code=404, detail="User or company not found.")
    
    company = user.company

    max_retries = 12
    retry_interval_seconds = 5
    tx_details = None

    for attempt in range(max_retries):
        tx_details = solana_service.get_transaction_details(payload.tx_signature)
        if tx_details:
            break
        await asyncio.sleep(retry_interval_seconds)

    if not tx_details:
        raise HTTPException(status_code=408, detail="Transaction confirmation timed out. Please check your wallet for transaction status.")
    
    expected_amount_raw = int(usd_amount_from_token * 1_000_000)
    
    if not (
        tx_details.get("to") == config.settings.MERCHANT_WALLET_ADDRESS and
        tx_details.get("mint") == config.settings.USDC_TOKEN_MINT_ADDRESS and
        abs(tx_details.get("amount_raw", 0) - expected_amount_raw) <= 1
    ):
        raise HTTPException(status_code=400, detail="Transaction details mismatch. Payment could not be verified.")

    TOKENS_PER_USD = 10000
    tokens_to_credit = int(usd_amount_from_token * TOKENS_PER_USD)
    if company.plan == 'free': company.plan = 'researcher'
    company.token_balance += tokens_to_credit
    
    billing_record = models.BillingHistory(
        company_id=company.id, 
        description=f"Token Purchase: +{tokens_to_credit:,} Tokens",
        amount_usd=usd_amount_from_token, 
        status="paid",
        invoice_url=f"https://solscan.io/tx/{payload.tx_signature}"
    )
    db.add(billing_record)
    db.commit()

    return {"message": "Payment successful", "tokens_credited": tokens_to_credit}