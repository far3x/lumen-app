import redis
import redis.asyncio as aioredis
from app.core.config import settings

sync_redis_pool = redis.ConnectionPool.from_url(settings.REDIS_URL, decode_responses=True)
async_redis_pool = aioredis.ConnectionPool.from_url(settings.REDIS_URL, decode_responses=True)

class RedisService:
    def __init__(self):
        self.r = redis.Redis(connection_pool=sync_redis_pool)
        self.ar = aioredis.Redis(connection_pool=async_redis_pool)

    def set_with_ttl(self, key: str, value: str, ttl_seconds: int):
        self.r.setex(name=key, time=ttl_seconds, value=value)

    def get(self, key: str) -> str | None:
        return self.r.get(key)

    def delete(self, key: str):
        self.r.delete(key)

redis_service = RedisService()