"""Set is_in_leaderboard default to False for new users

Revision ID: fecc86b1dc31
Revises: a98f6c6a10ee
Create Date: 2025-06-19 22:29:42.533221

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fecc86b1dc31'
# THIS IS THE CRITICAL FIX for the KeyError
down_revision: Union[str, None] = 'a98f6c6a10ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Render's default server_default for boolean is '1', which evaluates to True.
    # We change the default for new users to be False for 'is_in_leaderboard'.
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('is_in_leaderboard',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               server_default=sa.text('0'))


def downgrade() -> None:
    # Revert the default back to True if needed
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('is_in_leaderboard',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               server_default=sa.text('1'))