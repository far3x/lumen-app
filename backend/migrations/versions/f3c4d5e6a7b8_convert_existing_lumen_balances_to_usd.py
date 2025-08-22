"""convert_existing_lumen_balances_to_usd

Revision ID: f3c4d5e6a7b8
Revises: e5d1a8c9b7f6
Create Date: 2025-08-22 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f3c4d5e6a7b8'
down_revision: Union[str, None] = 'e5d1a8c9b7f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CONVERSION_RATE = 0.001
THRESHOLD = 1000.0

def upgrade() -> None:
    op.execute(f"UPDATE accounts SET usd_balance = usd_balance * {CONVERSION_RATE} WHERE usd_balance > {THRESHOLD}")
    op.execute(f"UPDATE accounts SET total_usd_earned = total_usd_earned * {CONVERSION_RATE} WHERE total_usd_earned > {THRESHOLD}")
    op.execute(f"UPDATE network_stats SET total_usd_distributed = total_usd_distributed * {CONVERSION_RATE} WHERE total_usd_distributed > {THRESHOLD}")
    op.execute(f"UPDATE contributions SET reward_amount = reward_amount * {CONVERSION_RATE} WHERE reward_amount > {THRESHOLD / 10}")


def downgrade() -> None:
    op.execute(f"UPDATE accounts SET usd_balance = usd_balance / {CONVERSION_RATE}")
    op.execute(f"UPDATE accounts SET total_usd_earned = total_usd_earned / {CONVERSION_RATE}")
    op.execute(f"UPDATE network_stats SET total_usd_distributed = total_usd_distributed / {CONVERSION_RATE}")
    op.execute(f"UPDATE contributions SET reward_amount = reward_amount / {CONVERSION_RATE}")