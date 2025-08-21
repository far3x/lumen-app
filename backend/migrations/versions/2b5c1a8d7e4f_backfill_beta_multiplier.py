"""Backfill reward_multiplier for existing beta users

Revision ID: 2b5c1a8d7e4f
Revises: 6e6c8f8defe0
Create Date: 2025-08-21 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.core.config import settings

# revision identifiers, used by Alembic.
revision: str = '2b5c1a8d7e4f'
# IMPORTANT: Find the revision ID of the migration you created in the last step 
# (the one that added the reward_multiplier column) and put it here.
down_revision: Union[str, None] = '6e6c8f8defe0' 
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # This data migration updates existing beta users.
    if settings.BETA_MODE_ENABLED:
        beta_max_users = settings.BETA_MAX_USERS
        print(f"Applying x2 reward_multiplier to existing beta users (ID <= {beta_max_users})...")
        op.execute(f"UPDATE users SET reward_multiplier = 2.0 WHERE id <= {beta_max_users}")


def downgrade() -> None:
    # This is a data migration, but we can revert it for completeness.
    # It assumes the default was 1.0, which it was.
    if settings.BETA_MODE_ENABLED:
        beta_max_users = settings.BETA_MAX_USERS
        print(f"Reverting reward_multiplier to 1.0 for beta users (ID <= {beta_max_users})...")
        op.execute(f"UPDATE users SET reward_multiplier = 1.0 WHERE id <= {beta_max_users}")