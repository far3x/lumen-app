import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class IrysService:
    """
    Service pour interagir avec le microservice Node.js Irys.
    Le microservice utilise le SDK officiel @irys/upload.
    """
    
    def __init__(self):
        self.service_url = settings.IRYS_SERVICE_URL
        self.is_available = False
        
        if not self.service_url:
            logger.error("Irys service disabled: IRYS_SERVICE_URL not configured.")
        else:
            logger.info(f"Irys service configured to use microservice at {self.service_url}")
            # Vérifier la disponibilité du service au démarrage
            try:
                import requests
                response = requests.get(f"{self.service_url}/health", timeout=5)
                if response.status_code == 200:
                    self.is_available = True
                    logger.info(f"Irys microservice is available at {self.service_url}")
                else:
                    logger.warning(f"Irys microservice returned status {response.status_code}")
            except Exception as e:
                logger.warning(f"Could not reach Irys microservice at startup: {e}")
                logger.info("The service will be checked again on first upload attempt.")

    def upload_code(self, data: str) -> str | None:
        """
        Upload du code vers Irys via le microservice Node.js.
        
        Args:
            data: Le contenu à uploader (string)
            
        Returns:
            str: L'ID de transaction Irys
            
        Raises:
            ConnectionError: Si le service n'est pas disponible
            ValueError: Si l'upload échoue
        """
        if not self.service_url:
            logger.error("Cannot upload to Irys: service URL not configured.")
            raise ConnectionError("Irys service is not available.")
        
        try:
            url = f"{self.service_url}/upload"
            
            logger.info(f"Uploading {len(data)} bytes to Irys via microservice...")
            
            # Utiliser requests pour les appels synchrones (depuis Celery tasks)
            import requests
            response = requests.post(
                url,
                data=data,
                headers={'Content-Type': 'text/plain'},
                timeout=60
            )
            
            if response.status_code != 200:
                error_detail = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                raise ValueError(f"Irys microservice returned status {response.status_code}: {error_detail}")
            
            result = response.json()
            tx_id = result.get('id')
            
            if not tx_id:
                raise ValueError("Irys upload response did not include a transaction ID.")
            
            logger.info(f"Successfully uploaded data to Irys. Transaction ID: {tx_id}")
            logger.info(f"   URL: {result.get('url', 'N/A')}")
            
            return tx_id
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to reach Irys microservice: {e}", exc_info=True)
            raise ConnectionError(f"Irys microservice unreachable: {e}")
        except Exception as e:
            logger.error(f"Irys upload failed: {e}", exc_info=True)
            raise e

    async def get_data(self, tx_id: str) -> str | None:
        """
        Récupération de données depuis Irys via le microservice.
        
        Args:
            tx_id: L'ID de transaction Irys
            
        Returns:
            str: Le contenu récupéré, ou None si erreur
        """
        if not tx_id:
            return None
        
        if not self.service_url:
            logger.error("Cannot get data from Irys: service URL not configured.")
            return None
        
        url = f"{self.service_url}/data/{tx_id}"
        
        try:
            logger.info(f"Fetching data from Irys for TX ID: {tx_id}")
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=30.0)
                response.raise_for_status()
                
                data = response.text
                logger.info(f"Successfully retrieved {len(data)} bytes from Irys")
                
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to fetch data from Irys for {tx_id}. Status: {e.response.status_code}")
            return None
        except Exception as e:
            logger.error(f"Error fetching data from Irys for {tx_id}: {e}", exc_info=True)
            return None

    async def get_info(self) -> dict | None:
        """
        Récupération des infos du uploader (adresse, balance).
        Utile pour le monitoring.
        """
        if not self.service_url:
            return None
        
        url = f"{self.service_url}/info"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error fetching Irys uploader info: {e}")
            return None

irys_service = IrysService()