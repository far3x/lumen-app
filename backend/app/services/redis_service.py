import redis
from app.core.config import settings

redis_pool = redis.ConnectionPool.from_url(settings.REDIS_URL, decode_responses=True)

def get_redis_connection():
    return redis.Redis(connection_pool=redis_pool)

class RedisService:
    def __init__(self):
        self.r = get_redis_connection()

    def set_with_ttl(self, key: str, value: str, ttl_seconds: int):
        self.r.setex(name=key, time=ttl_seconds, value=value)

    def get(self, key: str) -> str | None:
        return self.r.get(key)

    def delete(self, key: str):
        self.r.delete(key)

redis_service = RedisService()