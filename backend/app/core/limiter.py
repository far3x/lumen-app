from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

def get_limiter_key(request: Request) -> str:
    user = request.state.user if hasattr(request.state, 'user') else None
    
    if user and user.id:
        return str(user.id)
    
    return get_remote_address(request)

limiter = Limiter(key_func=get_limiter_key)