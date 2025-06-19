from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.db.database import Base, engine, SessionLocal
from app.api.v1.routers import auth, cli, users, public
from app.core.celery_app import celery_app
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "X-Lumen-Challenge", "X-Lumen-Signature", "X-Lumen-Timestamp"],
)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

@app.on_event("startup")
async def startup_event():
    logger.info("Application startup: Initializing database...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/checked successfully.")
        
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

    except Exception as e:
        logger.critical(f"FATAL ERROR during database startup: {e}")
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

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}