from fastapi import APIRouter, Depends, Query, Request, Header, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import json

from app.db import crud, database, models
from app.schemas import LeaderboardEntry, LeaderboardResponse, FeedbackCreate, PublicContributionResponse, NetworkStatsResponse
from app.api.v1 import dependencies
from app.core.limiter import limiter
from app.services.redis_service import redis_service
from app.services.price_service import price_service

router = APIRouter(tags=["Public"])

def get_visitor_id_key(request: Request) -> str:
    visitor_id = request.headers.get("X-Visitor-ID")
    if visitor_id:
        return visitor_id
    return request.client.host

@router.get("/token-price/sol")
@limiter.limit("120/minute")
async def get_sol_price(request: Request):
    price = await price_service.get_sol_price_usd()
    if price is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Could not retrieve SOL price.")
    return {"symbol": "SOL", "price_usd": price}

@router.get("/token-price/{token_symbol}")
@limiter.limit("120/minute")
def get_token_price(request: Request, token_symbol: str):
    if token_symbol.lower() != 'lumen':
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")
    
    price_str = redis_service.get("token_price:lumen_usd")
    if not price_str:
        return {"symbol": "LUMEN", "price_usd": 0.001, "cached": False}
        
    return {"symbol": "LUMEN", "price_usd": float(price_str), "cached": True}

@router.get("/leaderboard", response_model=LeaderboardResponse)
@limiter.limit("60/minute")
def get_leaderboard(
    request: Request,
    db: Session = Depends(database.get_db),
    current_user: models.User | None = Depends(dependencies.get_current_user_optional)
):
    cache_key = "cache:leaderboard"
    cached_leaderboard = redis_service.get(cache_key)

    if cached_leaderboard:
        return JSONResponse(content=json.loads(cached_leaderboard))
    
    top_users_data = crud.get_leaderboard(db, skip=0, limit=10)
    
    top_entries = []
    for rank, (user, total_usd_earned) in enumerate(top_users_data, start=1):
        display_name = user.display_name if user.is_in_leaderboard else f"User #{user.id}"
        top_entries.append(LeaderboardEntry(
            rank=rank,
            display_name=display_name,
            total_usd_earned=total_usd_earned
        ))

    current_user_rank_entry = None
    if current_user:
        user_rank_data = crud.get_user_rank(db, user_id=current_user.id)
        if user_rank_data:
            total_usd_earned = user_rank_data.total_usd_earned
            current_user_rank_entry = LeaderboardEntry(
                rank=user_rank_data.rank,
                display_name=user_rank_data.display_name,
                total_usd_earned=total_usd_earned
            )
    
    response_data = LeaderboardResponse(
        top_users=top_entries,
        current_user_rank=current_user_rank_entry
    )

    redis_service.set_with_ttl(cache_key, response_data.model_dump_json(), 60)

    return response_data


@router.get("/recent-contributions", response_model=list[PublicContributionResponse])
@limiter.limit("60/minute")
def get_recent_contributions(
    request: Request,
    db: Session = Depends(database.get_db),
    limit: int = Query(10, le=50, ge=1)
):
    cache_key = f"cache:recent_contributions:limit={limit}"
    cached_contributions = redis_service.get(cache_key)

    if cached_contributions:
        return JSONResponse(content=json.loads(cached_contributions))
    
    recent_contributions_data = crud.get_recent_processed_contributions(db, limit=limit)
    response_list = []
    for contrib, display_name in recent_contributions_data:
        response_list.append(PublicContributionResponse(
            id=contrib.id,
            created_at=contrib.created_at,
            reward_amount=contrib.reward_amount,
            user_display_name=display_name
        ))

    response_json = json.dumps([item.model_dump(mode='json') for item in response_list])

    redis_service.set_with_ttl(cache_key, response_json, 60)

    return response_list

@router.get("/network-stats", response_model=NetworkStatsResponse)
@limiter.limit("60/minute")
def get_network_stats(
    request: Request,
    db: Session = Depends(database.get_db)
):
    cache_key = "cache:network_stats"
    cached_stats = redis_service.get(cache_key)

    if cached_stats:
        return JSONResponse(content=json.loads(cached_stats))
    
    stats = crud.get_network_stats(db)
    
    if not stats:
        # Retourner des valeurs par défaut si aucune statistique n'existe
        response_data = NetworkStatsResponse(
            total_lloc=0,
            total_tokens=0,
            total_usd_distributed=0.0,
            total_contributions=0
        )
    else:
        response_data = NetworkStatsResponse(
            total_lloc=stats.total_lloc,
            total_tokens=stats.total_tokens,
            total_usd_distributed=stats.total_usd_distributed,
            total_contributions=stats.total_contributions
        )

    redis_service.set_with_ttl(cache_key, response_data.model_dump_json(), 60)

    return response_data

@router.post("/feedback", status_code=status.HTTP_201_CREATED)
@limiter.limit("2/day", key_func=get_visitor_id_key)
async def submit_feedback(
    request: Request,
    feedback_data: FeedbackCreate,
    x_visitor_id: str = Header(...),
    db: Session = Depends(database.get_db),
    current_user: models.User | None = Depends(dependencies.get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    
    db_feedback = models.Feedback(
        user_id=user_id,
        visitor_id=x_visitor_id,
        page=feedback_data.page,
        rating=feedback_data.rating,
        content=feedback_data.content
    )
    db.add(db_feedback)
    db.commit()
    
    return {"message": "Thank you for your feedback!"}