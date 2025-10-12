"""Switch to Gemini embeddings and update vector size

Revision ID: 1a2b3c4d5e6f
Revises: 4e5f6a7b8c9d
Create Date: 2025-10-12 15:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = '1a2b3c4d5e6f'
down_revision: Union[str, None] = '4e5f6a7b8c9d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    print("Switching to Gemini embeddings (1536 dimensions)...")
    
    # 1. Drop the old index if it exists
    op.drop_index('ix_contributions_embedding_hnsw', table_name='contributions', if_exists=True)

    # 2. Clear out all old embeddings as they are the wrong dimension
    op.execute("UPDATE contributions SET content_embedding = NULL")

    # 3. Alter the column to the new vector size
    op.alter_column('contributions', 'content_embedding',
               existing_type=Vector(384),
               type_=Vector(1536),
               nullable=True)

    # 4. Recreate the index with the new dimensions
    op.create_index(
        'ix_contributions_embedding_hnsw',
        'contributions',
        ['content_embedding'],
        unique=False,
        postgresql_using='hnsw',
        postgresql_with={'m': 16, 'ef_construction': 64},
        postgresql_ops={'content_embedding': 'vector_cosine_ops'}
    )
    print("Migration to Gemini embeddings complete.")


def downgrade() -> None:
    print("Downgrading to MiniLM embeddings (384 dimensions)...")
    
    # 1. Drop the new index if it exists
    op.drop_index('ix_contributions_embedding_hnsw', table_name='contributions', if_exists=True)

    # 2. Clear embeddings as they will be the wrong size
    op.execute("UPDATE contributions SET content_embedding = NULL")

    # 3. Alter the column back to the old vector size
    op.alter_column('contributions', 'content_embedding',
               existing_type=Vector(1536),
               type_=Vector(384),
               nullable=True)
    
    # 4. Recreate the old index
    op.create_index(
        'ix_contributions_embedding_hnsw',
        'contributions',
        ['content_embedding'],
        unique=False,
        postgresql_using='hnsw',
        postgresql_with={'m': 16, 'ef_construction': 64},
        postgresql_ops={'content_embedding': 'vector_cosine_ops'}
    )
    print("Downgrade to MiniLM embeddings complete.")