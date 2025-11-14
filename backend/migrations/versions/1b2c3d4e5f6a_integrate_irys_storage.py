"""Integrate Irys for decentralized storage

Revision ID: 1b2c3d4e5f6a
Revises: f9d8c7b6a5e4
Create Date: 2025-10-22 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b2c3d4e5f6a'
down_revision: Union[str, None] = 'f9d8c7b6a5e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('contributions', sa.Column('irys_tx_id', sa.String(length=64), nullable=True))
    op.add_column('contributions', sa.Column('content_preview', sa.Text(), nullable=True))
    op.create_index(op.f('ix_contributions_irys_tx_id'), 'contributions', ['irys_tx_id'], unique=True)
    
    op.alter_column('contributions', 'raw_content',
               existing_type=sa.TEXT(),
               nullable=True)

    print("Backfilling content_preview for existing contributions...")
    # This uses a common table expression and window function to get the first 50 lines.
    # It's more robust than splitting on newline characters which can be inconsistent.
    op.execute("""
        WITH numbered_lines AS (
            SELECT
                id,
                (row_number() OVER (PARTITION BY id)) as rn,
                line
            FROM contributions, unnest(string_to_array(raw_content, E'\\n')) as line
        )
        UPDATE contributions c
        SET content_preview = (
            SELECT string_agg(nl.line, E'\\n')
            FROM numbered_lines nl
            WHERE nl.id = c.id AND nl.rn <= 50
        )
        WHERE c.raw_content IS NOT NULL AND c.content_preview IS NULL;
    """)
    print("Backfill complete.")


def downgrade() -> None:
    op.execute("UPDATE contributions SET raw_content = '' WHERE raw_content IS NULL")
    
    op.alter_column('contributions', 'raw_content',
               existing_type=sa.TEXT(),
               nullable=False)
               
    op.drop_index(op.f('ix_contributions_irys_tx_id'), table_name='contributions')
    op.drop_column('contributions', 'irys_tx_id')
    op.drop_column('contributions', 'content_preview')