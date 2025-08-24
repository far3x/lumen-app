"""Add quality and code stats to network

Revision ID: 3a4b5c6d7e8f
Revises: 51230ff2b886
Create Date: 2025-08-25 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3a4b5c6d7e8f'
down_revision: Union[str, None] = '51230ff2b886'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('network_stats', sa.Column('total_lloc', sa.BigInteger(), nullable=False, server_default='0'))
    op.add_column('network_stats', sa.Column('total_tokens', sa.BigInteger(), nullable=False, server_default='0'))
    op.add_column('network_stats', sa.Column('mean_quality', sa.Float(), nullable=False, server_default='0.5'))
    op.add_column('network_stats', sa.Column('m2_quality', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('network_stats', sa.Column('variance_quality', sa.Float(), nullable=False, server_default='0.25'))
    op.add_column('network_stats', sa.Column('std_dev_quality', sa.Float(), nullable=False, server_default='0.5'))


def downgrade() -> None:
    op.drop_column('network_stats', 'std_dev_quality')
    op.drop_column('network_stats', 'variance_quality')
    op.drop_column('network_stats', 'm2_quality')
    op.drop_column('network_stats', 'mean_quality')
    op.drop_column('network_stats', 'total_tokens')
    op.drop_column('network_stats', 'total_lloc')