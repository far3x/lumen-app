import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class GithubService:
    def __init__(self):
        self.api_base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"Bearer {settings.GITHUB_SEARCH_PAT}",
            "X-GitHub-Api-Version": "2022-11-28"
        }

    async def search_code_snippet(self, snippet: str) -> bool:
        if not snippet or not snippet.strip():
            return False

        search_url = f"{self.api_base_url}/search/code"
        params = {'q': f'"{snippet}" in:file'}
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(search_url, headers=self.headers, params=params, timeout=15.0)
                
                if response.status_code == 403:
                    logger.warning(f"GitHub API rate limit likely hit. Response: {response.text}")
                    return False
                
                response.raise_for_status()
                data = response.json()
                
                total_count = data.get('total_count', 0)
                logger.info(f"GitHub code search for snippet returned {total_count} results.")
                return total_count > 0

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error during GitHub code search: {e.response.status_code} - {e.response.text}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during GitHub code search: {e}", exc_info=True)
            return False

github_service = GithubService()