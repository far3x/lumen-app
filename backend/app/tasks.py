import math
from app.core.celery_app import celery_app
from app.core.config import settings
from app.db.database import SessionLocal
from app.db import crud
from app.services.valuation import hybrid_valuation_service

@celery_app.task
def process_contribution(user_id: int, codebase: str):
    db = SessionLocal()
    try:
        user = crud.get_user(db, user_id=user_id)
        if not user:
            print(f"Error: User with ID {user_id} not found.")
            return

        print(f"Processing contribution for user {user_id} using Hybrid Valuation.")
        
        valuation_result = hybrid_valuation_service.calculate(db, codebase)
        base_reward = valuation_result.get("final_reward", 0.0)
        valuation_details = valuation_result.get("valuation_details", {})
        
        print(f"Valuation results: {valuation_details}")

        if base_reward > 0:
            total_reward_given = crud.apply_reward_to_user(db, user, base_reward)
            avg_complexity = valuation_details.get("avg_complexity", 0.0)
            crud.update_network_stats(db, avg_complexity, total_reward_given)
            crud.create_contribution_record(db, user, codebase, valuation_details, total_reward_given)
            print(f"Successfully processed and rewarded {total_reward_given:.4f} LUM for user {user_id}.")
        else:
            print(f"Contribution from user {user_id} yielded no reward.")

    finally:
        db.close()