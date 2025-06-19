from cryptography.fernet import Fernet
from app.core.config import settings

class EncryptionService:
    def __init__(self, key: str):
        self.fernet = Fernet(key.encode())

    def encrypt(self, data: str) -> str:
        return self.fernet.encrypt(data.encode()).decode()

    def decrypt(self, encrypted_data: str) -> str:
        return self.fernet.decrypt(encrypted_data.encode()).decode()

encryption_service = EncryptionService(key=settings.ENCRYPTION_KEY)