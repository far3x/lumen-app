"""Create and backfill languages table final

Revision ID: 5d1a2b3c4e5f
Revises: f0a1b2c3d4e5
Create Date: 2025-09-05 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5d1a2b3c4e5f'
down_revision: Union[str, None] = 'f0a1b2c3d4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### Create the new table ###
    languages_table = op.create_table('contribution_languages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_contribution_languages_id'), 'contribution_languages', ['id'], unique=False)

    # ### Data Migration: Backfill the new table from existing contributions ###
    conn = op.get_bind()
    
    # This query robustly handles both proper JSONB objects and double-encoded JSON strings
    # stored within the valuation_results column. It will correctly parse all records.
    query = """
    WITH parsed_contributions AS (
        SELECT
            CASE
                WHEN jsonb_typeof(valuation_results) = 'string'
                THEN (valuation_results ->> 0)::jsonb
                ELSE valuation_results
            END as parsed_results
        FROM contributions
    )
    SELECT DISTINCT key
    FROM parsed_contributions,
         jsonb_object_keys(parsed_results -> 'language_breakdown') as key
    WHERE
        jsonb_path_exists(parsed_results, '$.language_breakdown');
    """
    
    results = conn.execute(sa.text(query)).fetchall()
    
    unique_languages = set()
    for row in results:
        lang = row[0]
        if lang and isinstance(lang, str):
            unique_languages.add(lang)

    if unique_languages:
        print(f"Backfilling {len(unique_languages)} languages: {sorted(list(unique_languages))}")
        op.bulk_insert(languages_table,
            [{'name': lang} for lang in sorted(list(unique_languages))]
        )
    else:
        print("No languages found to backfill.")


def downgrade() -> None:
    op.drop_index(op.f('ix_contribution_languages_id'), table_name='contribution_languages')
    op.drop_table('contribution_languages')