from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from app.db import crud, models, database
from app.api.v1 import dependencies
from app.schemas import ContributionResponse, ValuationMetrics, AiAnalysis

router = APIRouter(prefix="/contributions", tags=["Contributions"])

@router.get("/{contribution_id}", response_model=ContributionResponse)
def get_single_contribution(
    contribution_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    contrib = crud.get_contribution_by_id(db, contribution_id)
    if not contrib or contrib.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contribution not found")

    valuation_details_data = {}
    if contrib.valuation_results:
        try:
            loaded_json = json.loads(contrib.valuation_results)
            if isinstance(loaded_json, dict):
                valuation_details_data = loaded_json
        except (json.JSONDecodeError, TypeError):
            valuation_details_data = {}

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

    return ContributionResponse(
        id=contrib.id,
        created_at=contrib.created_at,
        reward_amount=contrib.reward_amount,
        status=contrib.status,
        valuation_details=valuation_details_data,
        manual_metrics=manual_metrics,
        ai_analysis=ai_analysis
    )