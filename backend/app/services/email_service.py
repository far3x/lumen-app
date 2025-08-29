from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
from pathlib import Path
from datetime import datetime

class EmailService:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
            MAIL_STARTTLS=settings.MAIL_STARTTLS,
            MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True,
            TEMPLATE_FOLDER=Path(__file__).parent.parent / 'templates'
        )
        self.fm = FastMail(self.conf)

    async def send_contact_sales_confirmation(self, name: str, email: str):
        template_body = {
            "user_name": name,
            "year": datetime.now().year,
            "logo_url": settings.PUBLIC_LOGO_URL
        }
        message = MessageSchema(
            subject="Thank you for contacting Lumen Protocol",
            recipients=[email],
            template_body=template_body,
            subtype="html"
        )
        await self.fm.send_message(message, template_name="contact_sales_confirmation.html")

    async def send_business_verification_email(self, email: str, token: str):
        verification_link = f"{settings.BUSINESS_FRONTEND_URL}/verify?token={token}"
        template_body = {
            "verification_link": verification_link,
            "year": datetime.now().year,
            "logo_url": settings.PUBLIC_LOGO_URL
        }
        message = MessageSchema(
            subject="Lumen Protocol: Verify Your Business Account",
            recipients=[email],
            template_body=template_body,
            subtype="html"
        )
        await self.fm.send_message(message, template_name="business_verification_email.html")
    
    async def send_new_user_invitation_email(self, invited_by_name: str, company_name: str, invitee_email: str, token: str):
        signup_link = f"{settings.BUSINESS_FRONTEND_URL}/signup?invite_token={token}"
        template_body = {
            "invited_by_name": invited_by_name,
            "company_name": company_name,
            "signup_link": signup_link,
            "year": datetime.now().year,
            "logo_url": settings.PUBLIC_LOGO_URL
        }
        message = MessageSchema(
            subject=f"You've been invited to join {company_name} on Lumen Protocol",
            recipients=[invitee_email],
            template_body=template_body,
            subtype="html"
        )
        await self.fm.send_message(message, template_name="team_invitation_new_user.html")

    async def send_existing_user_invitation_email(self, invited_by_name: str, company_name: str, invitee_email: str, token: str):
        accept_link = f"{settings.BUSINESS_FRONTEND_URL}/accept-invite?token={token}"
        template_body = {
            "invited_by_name": invited_by_name,
            "company_name": company_name,
            "accept_link": accept_link,
            "year": datetime.now().year,
            "logo_url": settings.PUBLIC_LOGO_URL
        }
        message = MessageSchema(
            subject=f"You've been invited to join {company_name} on Lumen Protocol",
            recipients=[invitee_email],
            template_body=template_body,
            subtype="html"
        )
        await self.fm.send_message(message, template_name="team_invitation_existing_user.html")


email_service = EmailService()