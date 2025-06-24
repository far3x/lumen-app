from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db import crud, database, models
from app.schemas import LeaderboardEntry, ContributionResponse, ValuationMetrics, AiAnalysis, LeaderboardResponse
from app.api.v1 import dependencies
import json

router = APIRouter(tags=["Public"])

@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    db: Session = Depends(database.get_db),
    current_user: models.User | None = Depends(dependencies.get_current_user_optional)
):
    top_users_data = crud.get_leaderboard(db, skip=0, limit=10)
    
    top_10_entries = []
    for rank, (user, total_earned) in enumerate(top_users_data, start=1):
        top_10_entries.append(LeaderboardEntry(
            rank=rank,
            display_name=user.display_name,
            total_lum_earned=total_earned
        ))

    current_user_rank_entry = None
    if current_user:
        user_rank_data = crud.get_user_rank(db, user_id=current_user.id)
        if user_rank_data:
            current_user_rank_entry = LeaderboardEntry(
                rank=user_rank_data.rank,
                display_name=user_rank_data.display_name,
                total_lum_earned=user_rank_data.total_lum_earned
            )

    return LeaderboardResponse(
        top_users=top_10_entries,
        current_user_rank=current_user_rank_entry
    )


@router.get("/recent-contributions", response_model=list[ContributionResponse])
def get_recent_contributions(
    db: Session = Depends(database.get_db),
    limit: int = Query(10, le=50, ge=1)
):
    recent_contributions_data = crud.get_recent_processed_contributions(db, limit=limit)
    response_list = []
    for contrib, display_name in recent_contributions_data:
        valuation_data = {}
        if contrib.valuation_results:
            data = contrib.valuation_results
            if isinstance(data, str):
                try: data = json.loads(data)
                except (json.JSONDecodeError, TypeError): data = {}
            if isinstance(data, str):
                try: data = json.loads(data)
                except (json.JSONDecodeError, TypeError): data = {}
            if isinstance(data, dict):
                valuation_data = data
        
        manual_metrics = ValuationMetrics(
            total_lloc=valuation_data.get('total_lloc', 0),
            total_tokens=valuation_data.get('total_tokens', 0),
            avg_complexity=valuation_data.get('avg_complexity', 0.0),
            compression_ratio=valuation_data.get('compression_ratio', 0.0),
            language_breakdown=valuation_data.get('language_breakdown', {})
        )
        
        ai_analysis = AiAnalysis(
            project_clarity_score=valuation_data.get('project_clarity_score', 0.0),
            architectural_quality_score=valuation_data.get('architectural_quality_score', 0.0),
            code_quality_score=valuation_data.get('code_quality_score', 0.0),
            analysis_summary=valuation_data.get('analysis_summary')
        )

        response_list.append(ContributionResponse(
            id=contrib.id,
            created_at=contrib.created_at,
            reward_amount=contrib.reward_amount,
            status=contrib.status,
            valuation_details=valuation_data,
            manual_metrics=manual_metrics,
            ai_analysis=ai_analysis,
            user_display_name=display_name
        ))
    return response_list