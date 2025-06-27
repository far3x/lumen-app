from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'e2f4a5b6c7d8'
down_revision: Union[str, None] = '45d12a3b987c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('contributions', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_constraint('contributions_user_id_fkey', 'contributions', type_='foreignkey')
    op.create_foreign_key('contributions_user_id_fkey', 'contributions', 'users', ['user_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    op.drop_constraint('contributions_user_id_fkey', 'contributions', type_='foreignkey')
    op.create_foreign_key('contributions_user_id_fkey', 'contributions', 'users', ['user_id'], ['id'])
    op.alter_column('contributions', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=False)