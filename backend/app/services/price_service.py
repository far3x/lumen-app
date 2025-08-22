import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class PriceService:
    def __init__(self):
        self.api_base_url = "https://public-api.birdeye.so/defi"
        self.lumen_token_address = settings.LUM_TOKEN_MINT_ADDRESS
        self.headers = {"X-API-KEY": settings.BIRDEYE_API_KEY}

    async def get_lumen_price_usd(self) -> float | None:
        if not self.lumen_token_address or not settings.BIRDEYE_API_KEY:
            logger.warning("LUM_TOKEN_MINT_ADDRESS or BIRDEYE_API_KEY is not set. Cannot fetch price.")
            return None
            
        url = f"{self.api_base_url}/price?address={self.lumen_token_address}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                data = response.json()
                
                if data.get('data') and 'value' in data['data']:
                    price = float(data['data']['value'])
                    logger.info(f"Successfully fetched LUMEN price: ${price}")
                    return price
                else:
                    logger.warning(f"Birdeye API response for {self.lumen_token_address} did not contain price data.")
                    return None
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching price from Birdeye: {e.response.status_code} - {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching price: {e}", exc_info=True)
            return None

price_service = PriceService()