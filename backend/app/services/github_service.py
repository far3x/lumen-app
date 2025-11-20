import httpx
import re
import sys
from app.core.config import settings

class GithubService:
    def __init__(self):
        self.api_base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        if settings.GITHUB_SEARCH_PAT:
             self.headers["Authorization"] = f"Bearer {settings.GITHUB_SEARCH_PAT}"

        if not settings.GITHUB_SEARCH_PAT:
            print("[GITHUB_SERVICE_ERROR] GITHUB_SEARCH_PAT is not set in environment variables!", file=sys.stderr)

    async def search_code_snippet(self, search_query: str) -> bool:
        if not settings.GITHUB_SEARCH_PAT:
            print("[GITHUB_SERVICE_ERROR] Aborting search: GITHUB_SEARCH_PAT is missing.", file=sys.stderr)
            return False
            
        if not search_query or not search_query.strip():
            print("[GITHUB_SERVICE_ERROR] Aborting search: Search query is empty.", file=sys.stderr)
            return False

        search_url = f"{self.api_base_url}/search/code"
        params = {'q': f'{search_query} in:file'}
        
        print(f"[GITHUB_SERVICE_DEBUG] Sending search query to GitHub API.", file=sys.stderr)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(search_url, headers=self.headers, params=params, timeout=20.0)
                print(f"[GITHUB_SERVICE_DEBUG] GitHub API Response Status: {response.status_code}", file=sys.stderr)

                if response.status_code == 403:
                    print("[GITHUB_SERVICE_ERROR] GitHub API returned 403 Forbidden. Check your PAT permissions or rate limits.", file=sys.stderr)
                    return False
                
                response.raise_for_status()
                data = response.json()
                total_count = data.get('total_count', 0)
                
                print(f"[GITHUB_SERVICE_DEBUG] GitHub code search returned {total_count} results.", file=sys.stderr)
                
                return total_count > 0

        except httpx.HTTPStatusError as e:
            print(f"[GITHUB_SERVICE_ERROR] HTTP error during GitHub code search: {e.response.status_code} - {e.response.text}", file=sys.stderr)
            return False
        except Exception as e:
            print(f"[GITHUB_SERVICE_ERROR] Unexpected error during GitHub code search: {e}", file=sys.stderr)
            return False

    async def get_user_repos(self, access_token: str) -> list[dict]:
        """Fetch a list of repositories for the user."""
        url = f"{self.api_base_url}/user/repos"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        params = {
            "sort": "updated",
            "direction": "desc",
            "per_page": 100,
            "visibility": "all" 
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, params=params, timeout=10.0)
                response.raise_for_status()
                repos = response.json()
                return [
                    {
                        "id": repo["id"],
                        "name": repo["name"],
                        "full_name": repo["full_name"],
                        "private": repo["private"],
                        "description": repo["description"],
                        "language": repo["language"],
                        "updated_at": repo["updated_at"],
                        "default_branch": repo["default_branch"]
                    }
                    for repo in repos
                ]
        except Exception as e:
            print(f"[GITHUB_SERVICE_ERROR] Failed to fetch user repos: {e}", file=sys.stderr)
            return []

    async def download_repo_zip(self, access_token: str, full_name: str, default_branch: str) -> bytes | None:
        """Download the repository as a zip archive."""
        url = f"{self.api_base_url}/repos/{full_name}/zipball/{default_branch}"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                response = await client.get(url, headers=headers, timeout=60.0)
                response.raise_for_status()
                return response.content
        except Exception as e:
            print(f"[GITHUB_SERVICE_ERROR] Failed to download repo zip: {e}", file=sys.stderr)
            return None

github_service = GithubService()