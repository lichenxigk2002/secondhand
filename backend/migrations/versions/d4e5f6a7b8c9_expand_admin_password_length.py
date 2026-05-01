# -*- coding: utf-8 -*-
"""expand admin password length

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-05-01

"""
from alembic import op
import sqlalchemy as sa

revision = 'd4e5f6a7b8c9'
down_revision = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        'admin',
        'password',
        existing_type=sa.String(128),
        type_=sa.String(255),
        existing_nullable=False,
    )


def downgrade():
    op.alter_column(
        'admin',
        'password',
        existing_type=sa.String(255),
        type_=sa.String(128),
        existing_nullable=False,
    )
