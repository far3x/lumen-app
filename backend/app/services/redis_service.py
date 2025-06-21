import redis
from app.core.config import settings

# Initialize Redis connection pool
redis_pool = redis.ConnectionPool.from_url(settings.REDIS_URL, decode_responses=True)

def get_redis_connection():
    """Provides a Redis connection from the pool."""
    return redis.Redis(connection_pool=redis_pool)

class RedisService:
    def __init__(self):
        self.r = get_redis_connection()

    def set_with_ttl(self, key: str, value: str, ttl_seconds: int):
        """Sets a key-value pair with a time-to-live."""
        self.r.setex(name=key, time=ttl_seconds, value=value)

    def get(self, key: str) -> str | None:
        """Gets a value by key."""
        return self.r.get(key)

    def delete(self, key: str):
        """Deletes a key."""
        self.r.delete(key)

# Singleton instance for use across the application
redis_service = RedisService()