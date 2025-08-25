"""Add details to business models

Revision ID: 7a8b9c0d1e2f
Revises: 3a4b5c6d7e8f
Create Date: 2025-08-26 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a8b9c0d1e2f'
down_revision: Union[str, None] = '3a4b5c6d7e8f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('companies', sa.Column('company_size', sa.String(), nullable=True))
    op.add_column('companies', sa.Column('industry', sa.String(), nullable=True))
    op.add_column('business_users', sa.Column('job_title', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('business_users', 'job_title')
    op.drop_column('companies', 'industry')
    op.drop_column('companies', 'company_size')