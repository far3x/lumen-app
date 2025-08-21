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

email_service = EmailService()