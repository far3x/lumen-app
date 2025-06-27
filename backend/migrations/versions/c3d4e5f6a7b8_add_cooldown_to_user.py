from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'e1b2c3d4a5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('cooldown_until', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'cooldown_until')