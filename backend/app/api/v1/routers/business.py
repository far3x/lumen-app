from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db import crud, models, database
from app.schemas import ContactSalesCreate
from app.tasks import send_contact_sales_email_task
from app.core.limiter import limiter

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
        # Log the error properly in a real application
        print(f"Error in contact sales endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="There was an issue processing your request."
        )