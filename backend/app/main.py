from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.core.limiter import limiter
from app.core.config import settings
from app.db.database import engine, SessionLocal
from app.api.v1.routers import auth, cli, users, public, security, contributions, websockets, business, business_auth, business_data
import logging
from slowapi.middleware import SlowAPIMiddleware
import asyncio
from app.services.websocket_manager import manager
from app.api.v1.dependencies import get_current_user_optional
from app.tasks import update_token_price_task

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

app.state.limiter = limiter

@app.middleware("http")
async def add_user_to_state(request: Request, call_next):
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        await get_current_user_optional(request, db)
    finally:
        db.close()
    response = await call_next(request)
    return response

app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        settings.BUSINESS_FRONTEND_URL,
        "https://business.lumen.onl",
        "https://docs.lumen.onl"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Lumen-Challenge", "X-Lumen-Signature", "X-Lumen-Timestamp", "X-Visitor-ID"],
)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

@app.on_event("startup")
async def startup_event():
    logger.info("Application startup: Initializing...")
    try:
        logger.info("Database tables checked.")
        
        from app.db import crud
        db = SessionLocal()
        try:
            if not db.query(crud.models.NetworkStats).first():
                logger.info("Seeding initial network stats...")
                initial_stats = crud.models.NetworkStats()
                db.add(initial_stats)
                db.commit()
                logger.info("Initial network stats seeded.")
            else:
                logger.info("Network stats already exist.")
        except Exception as e:
            logger.error(f"Error seeding network stats: {e}")
        finally:
            db.close()
        
        logger.info("Triggering initial token price update on startup...")
        update_token_price_task.delay()
        
        asyncio.create_task(manager.listen_for_redis_messages())
        logger.info("Redis Pub/Sub listener started.")

    except Exception as e:
        logger.critical(f"FATAL ERROR during startup: {e}")
    logger.info("Application startup complete.")

@app.on_event("shutdown")
def shutdown_event():
    logger.info("Application shutdown: Closing database connections...")
    engine.dispose()
    logger.info("Database connections closed.")

app.include_router(auth.router, prefix="/api/v1")
app.include_router(cli.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(public.router, prefix="/api/v1")
app.include_router(security.router, prefix="/api/v1")
app.include_router(contributions.router, prefix="/api/v1")
app.include_router(websockets.router)
app.include_router(business.router, prefix="/api/v1")
app.include_router(business_auth.router, prefix="/api/v1")
app.include_router(business_data.router, prefix="/api/v1")

@app.get("/", tags=["Root"])
@limiter.limit("10/minute")
async def read_root(request: Request):
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}