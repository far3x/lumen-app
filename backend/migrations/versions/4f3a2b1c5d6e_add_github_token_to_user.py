"""Add github_access_token to users

Revision ID: 4f3a2b1c5d6e
Revises: 1b2c3d4e5f6a
Create Date: 2025-11-21 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '4f3a2b1c5d6e'
# This must point to the latest migration in your 'versions' folder
down_revision: Union[str, None] = '1b2c3d4e5f6a' 
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('github_access_token', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'github_access_token')