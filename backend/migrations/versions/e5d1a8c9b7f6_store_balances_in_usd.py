"""store_balances_in_usd

Revision ID: e5d1a8c9b7f6
Revises: 2b5c1a8d7e4f
Create Date: 2025-08-22 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'e5d1a8c9b7f6'
down_revision: Union[str, None] = '2b5c1a8d7e4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('accounts', 'lum_balance', new_column_name='usd_balance')
    op.alter_column('accounts', 'total_lum_earned', new_column_name='total_usd_earned')
    op.alter_column('network_stats', 'total_lum_distributed', new_column_name='total_usd_distributed')


def downgrade() -> None:
    op.alter_column('accounts', 'usd_balance', new_column_name='lum_balance')
    op.alter_column('accounts', 'total_usd_earned', new_column_name='total_lum_earned')
    op.alter_column('network_stats', 'total_usd_distributed', new_column_name='total_lum_distributed')