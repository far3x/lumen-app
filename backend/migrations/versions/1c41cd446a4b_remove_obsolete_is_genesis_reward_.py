"""Remove obsolete is_genesis_reward_claimed column from user

Revision ID: 1c41cd446a4b
Revises: fd891a7c6e54
Create Date: 2025-08-03 20:58:12.324188

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '1c41cd446a4b'
down_revision: Union[str, None] = 'fd891a7c6e54'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.drop_column('users', 'is_genesis_reward_claimed')

def downgrade() -> None:
    op.add_column('users', sa.Column('is_genesis_reward_claimed', sa.BOOLEAN(), server_default=sa.text('false'), autoincrement=False, nullable=False))
