from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import crud, database
from app.schemas import LeaderboardEntry, ContributionResponse, ValuationMetrics, AiAnalysis
import json

router = APIRouter(tags=["Public"])

@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(
    db: Session = Depends(database.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000)
):
    top_users_data = crud.get_leaderboard(db, skip=skip, limit=limit)
    leaderboard_entries = []
    for rank, (user, balance) in enumerate(top_users_data, start=skip + 1):
        leaderboard_entries.append(LeaderboardEntry(
            rank=rank,
            display_name=user.display_name,
            lum_balance=balance
        ))
    return leaderboard_entries

@router.get("/recent-contributions", response_model=list[ContributionResponse])
def get_recent_contributions(
    db: Session = Depends(database.get_db),
    limit: int = Query(10, le=50, ge=1)
):
    recent_contributions_data = crud.get_recent_processed_contributions(db, limit=limit)
    response_list = []
    for contrib, display_name in recent_contributions_data:
        valuation_details_data = json.loads(contrib.valuation_results) if contrib.valuation_results else {}
        
        manual_metrics = ValuationMetrics(
            total_lloc=valuation_details_data.get('total_lloc', 0),
            total_tokens=valuation_details_data.get('total_tokens', 0),
            avg_complexity=valuation_details_data.get('avg_complexity', 0.0),
            compression_ratio=valuation_details_data.get('compression_ratio', 0.0),
            language_breakdown=valuation_details_data.get('language_breakdown', {})
        )
        
        ai_analysis = AiAnalysis(
            project_clarity_score=valuation_details_data.get('project_clarity_score', 0.0),
            architectural_quality_score=valuation_details_data.get('architectural_quality_score', 0.0),
            code_quality_score=valuation_details_data.get('code_quality_score', 0.0),
            analysis_summary=valuation_details_data.get('analysis_summary')
        )

        response_list.append(ContributionResponse(
            id=contrib.id,
            created_at=contrib.created_at,
            reward_amount=contrib.reward_amount,
            status=contrib.status,
            valuation_details=valuation_details_data,
            manual_metrics=manual_metrics,
            ai_analysis=ai_analysis,
            user_display_name=display_name
        ))
    return response_list