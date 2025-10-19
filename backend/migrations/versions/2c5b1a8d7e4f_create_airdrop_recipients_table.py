"""Create airdrop_recipients table

Revision ID: 2c5b1a8d7e4f
Revises: 1a2b3c4d5e6f
Create Date: 2025-10-19 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2c5b1a8d7e4f'
down_revision: Union[str, None] = '1a2b3c4d5e6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('airdrop_recipients',
    sa.Column('solana_address', sa.String(), nullable=False),
    sa.Column('token_amount', sa.Numeric(precision=30, scale=10), nullable=False),
    sa.Column('has_claimed', sa.Boolean(), nullable=False),
    sa.Column('bnb_address', sa.String(), nullable=True),
    sa.Column('claim_transaction_hash', sa.String(), nullable=True),
    sa.Column('claimed_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('solana_address')
    )
    op.create_index(op.f('ix_airdrop_recipients_claim_transaction_hash'), 'airdrop_recipients', ['claim_transaction_hash'], unique=False)
    op.create_index(op.f('ix_airdrop_recipients_solana_address'), 'airdrop_recipients', ['solana_address'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_airdrop_recipients_solana_address'), table_name='airdrop_recipients')
    op.drop_index(op.f('ix_airdrop_recipients_claim_transaction_hash'), table_name='airdrop_recipients')
    op.drop_table('airdrop_recipients')