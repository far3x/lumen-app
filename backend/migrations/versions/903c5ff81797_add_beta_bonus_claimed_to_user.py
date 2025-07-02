"""add_beta_bonus_claimed_to_user

Revision ID: 903c5ff81797
Revises: bb5d75e356d9
Create Date: 2025-07-02 19:06:55.029877

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '903c5ff81797'
down_revision: Union[str, None] = 'bb5d75e356d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_beta_bonus_claimed', sa.Boolean(), server_default=sa.text('false'), nullable=False))


def downgrade() -> None:
    op.drop_column('users', 'is_beta_bonus_claimed')