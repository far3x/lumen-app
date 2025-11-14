import httpx
from irys_sdk import Builder, Uploader
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class IrysService:
    def __init__(self):
        self.client: Uploader | None = None
        if settings.IRYS_PRIVATE_KEY and settings.IRYS_TOKEN and settings.SOLANA_RPC_URL:
            try:
                builder = Builder(settings.IRYS_TOKEN).wallet(settings.IRYS_PRIVATE_KEY)
                
                if settings.IRYS_TOKEN == "solana":
                    builder = builder.rpc_url(settings.SOLANA_RPC_URL)
                
                if settings.IRYS_NETWORK == "devnet":
                    builder = builder.network("devnet")
                
                self.client = builder.build()
                logger.info(f"Irys service initialized on '{settings.IRYS_NETWORK}' for token '{settings.IRYS_TOKEN}' with address: {self.client.address}")
            except Exception as e:
                logger.error(f"Failed to initialize Irys client: {e}", exc_info=True)
        else:
            logger.error("Irys service disabled due to missing configuration (IRYS_PRIVATE_KEY, IRYS_TOKEN, or SOLANA_RPC_URL).")

    def upload_code(self, data: str) -> str | None:
        if not self.client:
            logger.error("Cannot upload to Irys: client not initialized.")
            raise ConnectionError("Irys service is not available.")
        
        try:
            response = self.client.upload(data.encode('utf-8'), tags=[('Content-Type', 'text/plain'), ('App-Name', 'Lumen-Protocol-v1')])
            tx_id = response.get('id')
            if not tx_id:
                raise ValueError("Irys upload response did not include a transaction ID.")
            logger.info(f"Successfully uploaded data to Irys. Transaction ID: {tx_id}")
            return tx_id
        except Exception as e:
            logger.error(f"Irys upload failed: {e}", exc_info=True)
            raise e

    async def get_data(self, tx_id: str) -> str | None:
        if not tx_id:
            return None
        
        url = f"https://gateway.irys.xyz/{tx_id}"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=30.0)
                response.raise_for_status()
                return response.text
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to fetch data from Irys gateway for {tx_id}. Status: {e.response.status_code}")
            return None
        except Exception as e:
            logger.error(f"Error fetching data from Irys gateway for {tx_id}: {e}", exc_info=True)
            return None

irys_service = IrysService()