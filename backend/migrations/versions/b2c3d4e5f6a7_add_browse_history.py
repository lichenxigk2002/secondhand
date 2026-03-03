# -*- coding: utf-8 -*-
"""add browse_history

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-27

"""
from alembic import op
import sqlalchemy as sa

revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'browse_history',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('goods_id', sa.Integer(), nullable=False),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['goods_id'], ['goods.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_browse_user', 'browse_history', ['user_id', 'create_time'])


def downgrade():
    op.drop_index('idx_browse_user', table_name='browse_history')
    op.drop_table('browse_history')
