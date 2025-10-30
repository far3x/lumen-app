"""Drop pending_crypto_payments table

Revision ID: f9d8c7b6a5e4
Revises: e8a9b0c1d2e3
Create Date: 2025-10-21 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f9d8c7b6a5e4'
down_revision: Union[str, None] = 'e8a9b0c1d2e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index(op.f('ix_pending_crypto_payments_status'), table_name='pending_crypto_payments')
    op.drop_index(op.f('ix_pending_crypto_payments_transaction_hash'), table_name='pending_crypto_payments')
    op.drop_index(op.f('ix_pending_crypto_payments_id'), table_name='pending_crypto_payments')
    op.drop_table('pending_crypto_payments')


def downgrade() -> None:
    op.create_table('pending_crypto_payments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('company_id', sa.Integer(), nullable=False),
    sa.Column('usd_amount', sa.Float(), nullable=False),
    sa.Column('tokens_to_credit', sa.BigInteger(), nullable=False),
    sa.Column('transaction_hash', sa.String(), nullable=False),
    sa.Column('status', sa.String(), server_default='pending', nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pending_crypto_payments_id'), 'pending_crypto_payments', ['id'], unique=False)
    op.create_index(op.f('ix_pending_crypto_payments_transaction_hash'), 'pending_crypto_payments', ['transaction_hash'], unique=True)
    op.create_index(op.f('ix_pending_crypto_payments_status'), 'pending_crypto_payments', ['status'], unique=False)