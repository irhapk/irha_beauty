"""add_email_to_orders

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add email column to orders table."""
    op.add_column(
        'orders',
        sa.Column('email', sa.String(length=255), nullable=False, server_default='')
    )


def downgrade() -> None:
    """Remove email column from orders table."""
    op.drop_column('orders', 'email')
