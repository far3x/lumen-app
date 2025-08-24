"""add_reconciled_status_to_payouts

Revision ID: e79058eca2b3
Revises: 987be0a76bc9
Create Date: 2025-08-23 22:49:49.461262

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e79058eca2b3'
down_revision: Union[str, None] = '987be0a76bc9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE payout_status_enum ADD VALUE 'RECONCILED'")


def downgrade() -> None:
    # Downgrading enums is complex and can be destructive if the value is in use.
    # For development, we can simply pass. In a real production scenario with data,
    # you would first need to migrate any 'RECONCILED' data back to 'FAILED'
    # before removing the enum value.
    pass