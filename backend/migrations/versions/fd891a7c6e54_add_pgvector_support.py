"""Add pgvector support

Revision ID: fd891a7c6e54
Revises: 903c5ff81797
Create Date: 2025-07-08 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = 'fd891a7c6e54'
down_revision: Union[str, None] = '903c5ff81797'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    
    op.add_column('contributions', sa.Column('embedding_vector', Vector(384), nullable=True))
    
    op.execute("""
        UPDATE contributions
        SET embedding_vector = CAST(content_embedding AS VECTOR)
        WHERE content_embedding IS NOT NULL AND content_embedding != 'null'
    """)
    
    op.drop_column('contributions', 'content_embedding')
    
    op.alter_column('contributions', 'embedding_vector', new_column_name='content_embedding')
    
    op.create_index(
        'ix_contributions_embedding_hnsw',
        'contributions',
        ['content_embedding'],
        unique=False,
        postgresql_using='hnsw',
        postgresql_with={'m': 16, 'ef_construction': 64},
        # THIS IS THE FIX: Explicitly specify the operator class for cosine distance
        postgresql_ops={'content_embedding': 'vector_cosine_ops'}
    )


def downgrade() -> None:
    op.drop_index('ix_contributions_embedding_hnsw', table_name='contributions')
    
    op.add_column('contributions', sa.Column('text_embedding', sa.Text(), nullable=True))
    
    op.execute("""
        UPDATE contributions
        SET text_embedding = content_embedding::text
        WHERE content_embedding IS NOT NULL
    """)
    
    op.drop_column('contributions', 'content_embedding')
    
    op.alter_column('contributions', 'text_embedding', new_column_name='content_embedding')