# -*- coding: utf-8 -*-
"""add goods_comment

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-03-04

"""
from alembic import op
import sqlalchemy as sa

revision = 'c3d4e5f6a7b8'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'goods_comment',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('goods_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.String(512), nullable=False),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['goods_id'], ['goods.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_goods_comment_goods', 'goods_comment', ['goods_id', 'create_time'])


def downgrade():
    op.drop_index('idx_goods_comment_goods', table_name='goods_comment')
    op.drop_table('goods_comment')
