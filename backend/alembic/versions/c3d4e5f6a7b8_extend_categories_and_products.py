"""extend_categories_and_products

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-03-02 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Categories
    op.add_column('categories', sa.Column('slug', sa.String(120), nullable=False, server_default=''))
    op.add_column('categories', sa.Column('status', sa.String(20), nullable=False, server_default='active'))
    op.add_column('categories', sa.Column('banner_image', sa.String(500), nullable=False, server_default=''))
    op.add_column('categories', sa.Column('category_image', sa.String(500), nullable=False, server_default=''))
    # Products
    op.add_column('products', sa.Column('slug', sa.String(220), nullable=False, server_default=''))
    op.add_column('products', sa.Column('image', sa.String(500), nullable=False, server_default=''))
    op.add_column('products', sa.Column('hover_image', sa.String(500), nullable=False, server_default=''))


def downgrade() -> None:
    op.drop_column('categories', 'category_image')
    op.drop_column('categories', 'banner_image')
    op.drop_column('categories', 'status')
    op.drop_column('categories', 'slug')
    op.drop_column('products', 'hover_image')
    op.drop_column('products', 'image')
    op.drop_column('products', 'slug')
