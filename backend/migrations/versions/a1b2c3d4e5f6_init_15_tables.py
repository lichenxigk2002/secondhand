# -*- coding: utf-8 -*-
"""init 15 tables

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2025-02-25

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('openid', sa.String(64), nullable=False),
        sa.Column('nick_name', sa.String(64), server_default='', nullable=True),
        sa.Column('avatar', sa.String(512), server_default='', nullable=True),
        sa.Column('phone', sa.String(20), server_default='', nullable=True),
        sa.Column('campus', sa.String(64), server_default='', nullable=True),
        sa.Column('credit_score', sa.Integer(), server_default='100', nullable=True),
        sa.Column('status', sa.SmallInteger(), server_default='1', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.Column('update_time', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('openid')
    )
    op.create_table(
        'admin',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(32), nullable=False),
        sa.Column('password', sa.String(128), nullable=False),
        sa.Column('real_name', sa.String(32), server_default='', nullable=True),
        sa.Column('role', sa.String(16), server_default='admin', nullable=True),
        sa.Column('status', sa.SmallInteger(), server_default='1', nullable=True),
        sa.Column('last_login_time', sa.DateTime(), nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.Column('update_time', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username')
    )
    op.create_table(
        'category',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('parent_id', sa.Integer(), server_default='0', nullable=True),
        sa.Column('name', sa.String(32), nullable=False),
        sa.Column('sort_order', sa.Integer(), server_default='0', nullable=True),
        sa.Column('status', sa.SmallInteger(), server_default='1', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'goods',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), server_default='0', nullable=True),
        sa.Column('title', sa.String(128), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('images', sa.JSON(), nullable=True),
        sa.Column('lat', sa.Numeric(10, 7), nullable=False),
        sa.Column('lng', sa.Numeric(10, 7), nullable=False),
        sa.Column('address', sa.String(128), server_default='', nullable=True),
        sa.Column('status', sa.SmallInteger(), server_default='1', nullable=True),
        sa.Column('audit_status', sa.SmallInteger(), server_default='0', nullable=True),
        sa.Column('view_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.Column('update_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('order_no', sa.String(32), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('seller_id', sa.Integer(), nullable=False),
        sa.Column('goods_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('status', sa.SmallInteger(), server_default='0', nullable=True),
        sa.Column('pay_type', sa.String(16), server_default='', nullable=True),
        sa.Column('remark', sa.String(256), server_default='', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.Column('complete_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['buyer_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['goods_id'], ['goods.id'], ),
        sa.ForeignKeyConstraint(['seller_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('order_no')
    )
    op.create_table(
        'order_status_log',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('from_status', sa.SmallInteger(), nullable=True),
        sa.Column('to_status', sa.SmallInteger(), nullable=False),
        sa.Column('operator_type', sa.String(16), server_default='user', nullable=True),
        sa.Column('operator_id', sa.Integer(), server_default='0', nullable=True),
        sa.Column('remark', sa.String(256), server_default='', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'conversation',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user1_id', sa.Integer(), nullable=False),
        sa.Column('user2_id', sa.Integer(), nullable=False),
        sa.Column('goods_id', sa.Integer(), server_default='0', nullable=True),
        sa.Column('last_message_id', sa.Integer(), server_default='0', nullable=True),
        sa.Column('last_message_at', sa.DateTime(), nullable=True),
        sa.Column('user1_unread', sa.Integer(), server_default='0', nullable=True),
        sa.Column('user2_unread', sa.Integer(), server_default='0', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.Column('update_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user1_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['user2_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'message',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('from_user_id', sa.Integer(), nullable=False),
        sa.Column('to_user_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('msg_type', sa.String(16), server_default='text', nullable=True),
        sa.Column('extra', sa.JSON(), nullable=True),
        sa.Column('is_read', sa.SmallInteger(), server_default='0', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversation.id'], ),
        sa.ForeignKeyConstraint(['from_user_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['to_user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'message_read',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('message_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('read_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['message_id'], ['message.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'evaluation',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('from_user_id', sa.Integer(), nullable=False),
        sa.Column('to_user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(8), nullable=False),
        sa.Column('star', sa.SmallInteger(), nullable=False),
        sa.Column('comment', sa.String(512), server_default='', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['from_user_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.ForeignKeyConstraint(['to_user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'credit_log',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('change_value', sa.Integer(), nullable=False),
        sa.Column('before_score', sa.Integer(), nullable=False),
        sa.Column('after_score', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(32), server_default='', nullable=True),
        sa.Column('ref_id', sa.Integer(), server_default='0', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'report',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('reporter_id', sa.Integer(), nullable=False),
        sa.Column('target_type', sa.String(16), nullable=False),
        sa.Column('target_id', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(32), server_default='', nullable=True),
        sa.Column('content', sa.String(512), server_default='', nullable=True),
        sa.Column('status', sa.SmallInteger(), server_default='0', nullable=True),
        sa.Column('handler_id', sa.Integer(), server_default='0', nullable=True),
        sa.Column('handle_remark', sa.String(256), server_default='', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.Column('handle_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['reporter_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'favorite',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('goods_id', sa.Integer(), nullable=False),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['goods_id'], ['goods.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'goods_id', name='uq_favorite_user_goods')
    )
    op.create_table(
        'notification',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(64), nullable=False),
        sa.Column('content', sa.String(512), server_default='', nullable=True),
        sa.Column('type', sa.String(16), server_default='system', nullable=True),
        sa.Column('ref_id', sa.Integer(), server_default='0', nullable=True),
        sa.Column('is_read', sa.SmallInteger(), server_default='0', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'operation_log',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('admin_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(32), nullable=False),
        sa.Column('target_type', sa.String(16), server_default='', nullable=True),
        sa.Column('target_id', sa.Integer(), server_default='0', nullable=True),
        sa.Column('detail', sa.String(512), server_default='', nullable=True),
        sa.Column('ip', sa.String(64), server_default='', nullable=True),
        sa.Column('create_time', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['admin_id'], ['admin.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_goods_user_status', 'goods', ['user_id', 'status'])
    op.create_index('idx_goods_category', 'goods', ['category_id'])
    op.create_index('idx_goods_create_time', 'goods', ['create_time'])
    op.create_index('idx_order_buyer', 'orders', ['buyer_id'])
    op.create_index('idx_order_seller', 'orders', ['seller_id'])
    op.create_index('idx_message_conversation', 'message', ['conversation_id', 'create_time'])
    op.create_index('idx_report_status', 'report', ['status', 'target_type'])
    op.create_index('idx_operation_log_admin', 'operation_log', ['admin_id', 'create_time'])


def downgrade():
    op.drop_index('idx_operation_log_admin', 'operation_log')
    op.drop_index('idx_report_status', 'report')
    op.drop_index('idx_message_conversation', 'message')
    op.drop_index('idx_order_seller', 'orders')
    op.drop_index('idx_order_buyer', 'orders')
    op.drop_index('idx_goods_create_time', 'goods')
    op.drop_index('idx_goods_category', 'goods')
    op.drop_index('idx_goods_user_status', 'goods')

    op.drop_table('operation_log')
    op.drop_table('notification')
    op.drop_table('favorite')
    op.drop_table('report')
    op.drop_table('credit_log')
    op.drop_table('evaluation')
    op.drop_table('message_read')
    op.drop_table('message')
    op.drop_table('conversation')
    op.drop_table('order_status_log')
    op.drop_table('orders')
    op.drop_table('goods')
    op.drop_table('category')
    op.drop_table('admin')
    op.drop_table('user')
