"""Add pending_crypto_payments table

Revision ID: e8a9b0c1d2e3
Revises: 2c5b1a8d7e4f
Create Date: 2025-10-20 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8a9b0c1d2e3'
down_revision: Union[str, None] = '2c5b1a8d7e4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
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


def downgrade() -> None:
    op.drop_index(op.f('ix_pending_crypto_payments_status'), table_name='pending_crypto_payments')
    op.drop_index(op.f('ix_pending_crypto_payments_transaction_hash'), table_name='pending_crypto_payments')
    op.drop_index(op.f('ix_pending_crypto_payments_id'), table_name='pending_crypto_payments')
    op.drop_table('pending_crypto_payments')