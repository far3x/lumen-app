import httpx
import logging
import re
import sys
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
        if not settings.GITHUB_SEARCH_PAT:
            logger.error("GITHUB_SEARCH_PAT is not set in environment variables!")


    async def search_code_snippet(self, snippet: str) -> bool:
        if not settings.GITHUB_SEARCH_PAT:
            logger.error("Aborting search because GITHUB_SEARCH_PAT is missing.")
            return False
            
        if not snippet or not snippet.strip():
            return False

        cleaned_snippet = re.sub(r'\s+', ' ', snippet).strip()
        sanitized_snippet = cleaned_snippet.replace('"', "'") 
        truncated_snippet = sanitized_snippet[:250]
        
        search_url = f"{self.api_base_url}/search/code"
        quoted_snippet = f'"{truncated_snippet}"'
        params = {'q': f'{quoted_snippet} in:file'}
        
        logger.info("Preparing to query GitHub API.")
        logger.info(f"URL: {search_url}")
        logger.info(f"Query Params: {params}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(search_url, headers=self.headers, params=params, timeout=15.0)
                
                logger.info(f"GitHub API Response Status Code: {response.status_code}")

                if response.status_code == 403:
                    logger.warning("GitHub API returned 403 Forbidden. Check your PAT or rate limits.")
                    return False
                
                response.raise_for_status()
                data = response.json()
                
                total_count = data.get('total_count', 0)
                
                if total_count > 0:
                    first_match_url = data.get('items', [{}])[0].get('html_url', 'N/A')
                    logger.info(f"GitHub search FOUND {total_count} public match(es). First match: {first_match_url}")
                else:
                    logger.info(f"GitHub code search returned {total_count} results.")
                
                return total_count > 0

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error during GitHub code search: {e.response.status_code} - {e.response.text}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during GitHub code search: {e}")
            return False

github_service = GithubService()