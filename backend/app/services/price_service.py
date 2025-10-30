import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class PriceService:
    def __init__(self):
        self.api_base_url = "https://public-api.birdeye.so/defi"
        self.headers = {"X-API-KEY": settings.BIRDEYE_API_KEY}
        self.lumen_token_address = settings.LUM_TOKEN_MINT_ADDRESS
        self.sol_token_address = "So11111111111111111111111111111111111111112"

    async def get_token_price_usd(self, token_address: str) -> float | None:
        if not token_address or not settings.BIRDEYE_API_KEY:
            logger.warning(f"Token address or BIRDEYE_API_KEY is not set. Cannot fetch price for {token_address}.")
            return None
            
        url = f"{self.api_base_url}/price?address={token_address}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                data = response.json()
                
                if data.get('data') and 'value' in data['data']:
                    price = float(data['data']['value'])
                    logger.info(f"Successfully fetched price for {token_address}: ${price}")
                    return price
                else:
                    logger.warning(f"Birdeye API response for {token_address} did not contain price data.")
                    return None
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching price from Birdeye for {token_address}: {e.response.status_code} - {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching price for {token_address}: {e}", exc_info=True)
            return None

    async def get_lumen_price_usd(self) -> float | None:
        return await self.get_token_price_usd(self.lumen_token_address)
        
    async def get_sol_price_usd(self) -> float | None:
        return await self.get_token_price_usd(self.sol_token_address)

price_service = PriceService()