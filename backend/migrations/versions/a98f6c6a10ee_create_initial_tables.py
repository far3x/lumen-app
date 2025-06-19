"""Create initial tables

Revision ID: <your_new_revision_id>
Revises: 
Create Date: <your_new_date>

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '<your_new_revision_id>' # This will be auto-filled
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=True),
        sa.Column('github_id', sa.String(), nullable=True),
        sa.Column('google_id', sa.String(), nullable=True),
        sa.Column('display_name', sa.String(), nullable=True),
        sa.Column('is_genesis_reward_claimed', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('is_in_leaderboard', sa.Boolean(), nullable=False, server_default=sa.text('1')),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('verification_token', sa.String(), nullable=True),
        sa.Column('password_reset_token', sa.String(), nullable=True),
        sa.Column('password_reset_expires', sa.Float(), nullable=True),
        sa.Column('is_two_factor_enabled', sa.Boolean(), nullable=False, server_default=sa.text('0')),
        sa.Column('two_factor_secret', sa.String(), nullable=True),
        sa.Column('two_factor_backup_codes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('github_id'),
        sa.UniqueConstraint('google_id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    op.create_table('accounts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('lum_balance', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_accounts_id'), 'accounts', ['id'], unique=False)

    op.create_table('network_stats',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('total_lum_distributed', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_contributions', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('mean_complexity', sa.Float(), nullable=False, server_default='5.0'),
        sa.Column('m2_complexity', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('variance_complexity', sa.Float(), nullable=False, server_default='4.0'),
        sa.Column('std_dev_complexity', sa.Float(), nullable=False, server_default='2.0'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('personal_access_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('token_hash', sa.String(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_personal_access_tokens_id'), 'personal_access_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_personal_access_tokens_token_hash'), 'personal_access_tokens', ['token_hash'], unique=True)
    
    op.create_table('contributions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
        sa.Column('raw_content', sa.Text(), nullable=False),
        sa.Column('valuation_results', sa.Text(), nullable=False),
        sa.Column('reward_amount', sa.Float(), nullable=False),
        sa.Column('content_embedding', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='PENDING'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_contributions_id'), 'contributions', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_contributions_id'), table_name='contributions')
    op.drop_table('contributions')
    op.drop_index(op.f('ix_personal_access_tokens_token_hash'), table_name='personal_access_tokens')
    op.drop_index(op.f('ix_personal_access_tokens_id'), table_name='personal_access_tokens')
    op.drop_table('personal_access_tokens')
    op.drop_table('network_stats')
    op.drop_index(op.f('ix_accounts_id'), table_name='accounts')
    op.drop_table('accounts')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')