# -*- coding: utf-8 -*-
"""normalize demo area labels

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-05-01

"""
from alembic import op


revision = 'f6a7b8c9d0e1'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None


USER_AREA_REPLACEMENTS = {
    '南校区 3 栋': '宿舍区 3 栋',
    '南校区 图书馆': '图书馆',
    '北校区 1 栋': '宿舍区 1 栋',
    '东区 2 栋': '宿舍区 2 栋',
    '西区 5 栋': '快递点',
    '东区 创客空间': '教学区 创客空间',
    '北校区 研究生公寓': '宿舍区 研究生公寓',
}

GOODS_ADDRESS_REPLACEMENTS = {
    '南校区图书馆东门': '图书馆东门',
    '北校区 1 栋楼下': '宿舍区 1 栋楼下',
    '东区 2 栋门口': '宿舍区 2 栋门口',
    '北校区教学楼 A 座': '教学楼 A 座',
    '西区 5 栋快递点': '快递点',
    '南校区 3 栋宿舍楼下': '宿舍区 3 栋楼下',
    '西区 5 栋': '宿舍区 5 栋',
    '东区操场看台': '运动场看台',
    '北校区研究生公寓': '研究生公寓',
    '北校区 1 栋': '宿舍区 1 栋',
    '东区创客空间': '教学区创客空间',
}

ORDER_REMARK_REPLACEMENTS = {
    '北校区食堂门口自取。': '食堂门口自取。',
    '已约今晚东区门口验货。': '已约今晚宿舍区门口验货。',
}

MESSAGE_REPLACEMENTS = {
    '今晚东区门口见，我带上测试线。': '今晚宿舍区门口见，我带上测试线。',
}


def _replace(table, column, replacements):
    for old, new in replacements.items():
        op.execute(f"UPDATE {table} SET {column} = '{new}' WHERE {column} = '{old}'")


def upgrade():
    _replace('`user`', 'campus', USER_AREA_REPLACEMENTS)
    _replace('goods', 'address', GOODS_ADDRESS_REPLACEMENTS)
    _replace('orders', 'remark', ORDER_REMARK_REPLACEMENTS)
    _replace('message', 'content', MESSAGE_REPLACEMENTS)


def downgrade():
    _replace('message', 'content', {v: k for k, v in MESSAGE_REPLACEMENTS.items()})
    _replace('orders', 'remark', {v: k for k, v in ORDER_REMARK_REPLACEMENTS.items()})
    _replace('goods', 'address', {v: k for k, v in GOODS_ADDRESS_REPLACEMENTS.items()})
    _replace('`user`', 'campus', {v: k for k, v in USER_AREA_REPLACEMENTS.items()})
