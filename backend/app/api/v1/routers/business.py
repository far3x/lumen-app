from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
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
    current_user: models.BusinessUser | None = Depends(dependencies.get_current_business_user_optional)
):
    auth_header = request.headers.get("Authorization")

    if auth_header and auth_header.lower().startswith("x402 "):
        async with httpx.AsyncClient() as client:
            try:
                facilitator_url = f"{config.settings.FACILITATOR_URL}{request.url.path}"
                facilitator_response = await client.request(
                    method=request.method, url=facilitator_url, headers=request.headers,
                    content=await request.body(), timeout=30.0
                )
                
                if facilitator_response.status_code == 200 and facilitator_response.headers.get("x-verified"):
                    payment_details = facilitator_response.json()
                    encoded_data = payment_details.get("data")
                    
                    if not encoded_data: raise HTTPException(status_code=400, detail="Missing data in payment verification.")

                    try:
                        data_payload = jwt.decode(encoded_data, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
                        user_id = int(data_payload.get("sub"))
                        usd_amount_from_token = float(data_payload.get("amount"))
                    except (JWTError, ValueError, TypeError):
                        raise HTTPException(status_code=400, detail="Invalid data in payment verification.")

                    if not math.isclose(usd_amount_from_token, payload.usd_amount):
                         raise HTTPException(status_code=400, detail="Amount mismatch during verification.")
                    
                    user = crud.get_business_user_by_id(db, user_id)
                    if not user or not user.company:
                         raise HTTPException(status_code=404, detail="User or company not found.")
                    company = user.company

                    TOKENS_PER_USD = 10000
                    tokens_to_credit = int(payload.usd_amount * TOKENS_PER_USD)
                    if company.plan == 'free': company.plan = 'researcher'
                    company.token_balance += tokens_to_credit
                    
                    billing_record = models.BillingHistory(
                        company_id=company.id, description=f"Token Purchase: +{tokens_to_credit:,} Tokens",
                        amount_usd=payload.usd_amount, status="paid",
                        invoice_url=f"https://solscan.io/tx/{payment_details.get('signature')}"
                    )
                    db.add(billing_record)
                    db.commit()

                    return {"message": "Payment successful", "tokens_credited": tokens_to_credit}
                else:
                    return Response(content=facilitator_response.text, status_code=facilitator_response.status_code, headers=facilitator_response.headers)
            except httpx.RequestError:
                raise HTTPException(status_code=503, detail="Facilitator service unavailable")
    else:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required to create a charge.")

        data_to_encode = {
            "sub": str(current_user.id), "amount": payload.usd_amount,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
        }
        encoded_data = jwt.encode(data_to_encode, config.settings.SECRET_KEY, algorithm=config.settings.ALGORITHM)

        headers = {
            "WWW-Authenticate": f'x402 network="solana", recipient="{config.settings.MERCHANT_WALLET_ADDRESS}", amount="{payload.usd_amount}", currency="usd", data="{encoded_data}"'
        }
        return Response(status_code=402, headers=headers)
