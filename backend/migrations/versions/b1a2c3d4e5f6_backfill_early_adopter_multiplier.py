"""backfill early adopter multiplier

Revision ID: b1a2c3d4e5f6
Revises: 3d9f1a2b8c7e
Create Date: 2025-09-20 21:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.core.config import settings

# revision identifiers, used by Alembic.
revision: str = 'b1a2c3d4e5f6'
down_revision: Union[str, None] = '3d9f1a2b8c7e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    beta_max_users = 200
    early_adopter_limit = 1000
    
    print(f"Applying x1.5 reward_multiplier to early adopter users (ID > {beta_max_users} and ID <= {early_adopter_limit})...")
    op.execute(
        f"""
        UPDATE users 
        SET reward_multiplier = 1.5 
        WHERE id > 200 AND id <= {early_adopter_limit};
        """
    )


def downgrade() -> None:
    beta_max_users = settings.BETA_MAX_USERS
    early_adopter_limit = 1000

    print(f"Reverting reward_multiplier to 1.0 for early adopter users (ID > {beta_max_users} and ID <= {early_adopter_limit})...")
    op.execute(
        f"""
        UPDATE users 
        SET reward_multiplier = 1.0 
        WHERE id > {beta_max_users} AND id <= {early_adopter_limit};
        """
    )