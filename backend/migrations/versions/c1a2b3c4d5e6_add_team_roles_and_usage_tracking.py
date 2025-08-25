"""Add team roles and usage tracking

Revision ID: c1a2b3c4d5e6
Revises: 8a9b0c1d2e3f
Create Date: 2025-08-28 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1a2b3c4d5e6'
down_revision: Union[str, None] = '8a9b0c1d2e3f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # The lines that tried to add the 'role' column have been removed.
    # The 'role' column was already added in migration 84ecef8f462d.
    
    # Create the new api_key_usage_events table
    op.create_table('api_key_usage_events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('api_key_id', sa.Integer(), nullable=False),
    sa.Column('company_id', sa.Integer(), nullable=False),
    sa.Column('tokens_used', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['api_key_id'], ['api_keys.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_api_key_usage_events_api_key_id'), 'api_key_usage_events', ['api_key_id'], unique=False)
    op.create_index(op.f('ix_api_key_usage_events_company_id'), 'api_key_usage_events', ['company_id'], unique=False)
    op.create_index(op.f('ix_api_key_usage_events_created_at'), 'api_key_usage_events', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_api_key_usage_events_created_at'), table_name='api_key_usage_events')
    op.drop_index(op.f('ix_api_key_usage_events_company_id'), table_name='api_key_usage_events')
    op.drop_index(op.f('ix_api_key_usage_events_api_key_id'), table_name='api_key_usage_events')
    op.drop_table('api_key_usage_events')
    # No need to downgrade the 'role' column as it's part of another migration.