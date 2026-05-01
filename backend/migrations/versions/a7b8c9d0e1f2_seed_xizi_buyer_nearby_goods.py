# -*- coding: utf-8 -*-
"""seed xizi buyer nearby goods

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-05-01

"""
from datetime import datetime, timedelta
from decimal import Decimal

from alembic import op
import sqlalchemy as sa


revision = 'a7b8c9d0e1f2'
down_revision = 'f6a7b8c9d0e1'
branch_labels = None
depends_on = None


SELLERS = [
    {
        'openid': 'demo_nearby_seller_yiran',
        'nick_name': '许亦然',
        'avatar': 'https://i.pravatar.cc/160?img=32',
        'phone': '13800020001',
        'credit_score': 98,
    },
    {
        'openid': 'demo_nearby_seller_chenmo',
        'nick_name': '陈墨',
        'avatar': 'https://i.pravatar.cc/160?img=15',
        'phone': '13800020002',
        'credit_score': 96,
    },
    {
        'openid': 'demo_nearby_seller_zhixia',
        'nick_name': '周知夏',
        'avatar': 'https://i.pravatar.cc/160?img=47',
        'phone': '13800020003',
        'credit_score': 99,
    },
]

GOODS = [
    {
        'seller': 'demo_nearby_seller_yiran',
        'category': '数码',
        'title': '九成新 iPad Air 5 64G',
        'description': '自用平板，屏幕无明显划痕，主要用于记笔记和看课件，带保护壳。',
        'price': '2480.00',
        'images': ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80'],
        'view_count': 86,
        'minutes_ago': 35,
    },
    {
        'seller': 'demo_nearby_seller_chenmo',
        'category': '数码',
        'title': '机械键盘 87 键热插拔',
        'description': '茶轴，附备用键帽和拔轴器，宿舍学习办公都可以，功能正常。',
        'price': '168.00',
        'images': ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80'],
        'view_count': 64,
        'minutes_ago': 50,
    },
    {
        'seller': 'demo_nearby_seller_zhixia',
        'category': '书籍',
        'title': '高等数学教材和习题册',
        'description': '同济版高数教材配套习题册，少量笔记，适合期末复习。',
        'price': '26.00',
        'images': ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80'],
        'view_count': 51,
        'minutes_ago': 70,
    },
    {
        'seller': 'demo_nearby_seller_yiran',
        'category': '生活用品',
        'title': '宿舍折叠桌和护眼台灯',
        'description': '折叠桌稳定，台灯三档亮度，搬宿舍整理闲置，一起出更方便。',
        'price': '45.00',
        'images': ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80'],
        'view_count': 39,
        'minutes_ago': 95,
    },
    {
        'seller': 'demo_nearby_seller_chenmo',
        'category': '数码',
        'title': 'Sony 降噪耳机 WH-1000XM4',
        'description': '功能正常，耳罩去年换过，适合自习室和通勤使用。',
        'price': '899.00',
        'images': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'],
        'view_count': 72,
        'minutes_ago': 120,
    },
]


user_table = sa.table(
    'user',
    sa.column('openid', sa.String(64)),
    sa.column('nick_name', sa.String(64)),
    sa.column('avatar', sa.String(512)),
    sa.column('phone', sa.String(20)),
    sa.column('campus', sa.String(64)),
    sa.column('credit_score', sa.Integer()),
    sa.column('status', sa.SmallInteger()),
    sa.column('create_time', sa.DateTime()),
    sa.column('update_time', sa.DateTime()),
)

goods_table = sa.table(
    'goods',
    sa.column('user_id', sa.Integer()),
    sa.column('category_id', sa.Integer()),
    sa.column('title', sa.String(128)),
    sa.column('description', sa.Text()),
    sa.column('price', sa.Numeric(10, 2)),
    sa.column('images', sa.JSON()),
    sa.column('lat', sa.Numeric(10, 7)),
    sa.column('lng', sa.Numeric(10, 7)),
    sa.column('address', sa.String(128)),
    sa.column('status', sa.SmallInteger()),
    sa.column('audit_status', sa.SmallInteger()),
    sa.column('view_count', sa.Integer()),
    sa.column('create_time', sa.DateTime()),
    sa.column('update_time', sa.DateTime()),
)


def _scalar(conn, sql, params=None):
    return conn.execute(sa.text(sql), params or {}).scalar()


def upgrade():
    conn = op.get_bind()
    now = datetime.utcnow()
    xizi = conn.execute(sa.text(
        "SELECT id FROM `user` WHERE nick_name = :name ORDER BY id DESC LIMIT 1"
    ), {'name': '熙子'}).mappings().first()
    if not xizi:
        return

    ref = conn.execute(sa.text(
        "SELECT lat, lng, address FROM goods WHERE user_id = :uid ORDER BY create_time DESC LIMIT 1"
    ), {'uid': xizi['id']}).mappings().first()
    ref_lat = Decimal(str(ref['lat'])) if ref and ref['lat'] is not None else Decimal('23.1291630')
    ref_lng = Decimal(str(ref['lng'])) if ref and ref['lng'] is not None else Decimal('113.2644350')
    ref_address = (ref['address'] if ref and ref['address'] else '宿舍区门口')

    for seller in SELLERS:
        exists = _scalar(conn, "SELECT id FROM `user` WHERE openid = :openid", {'openid': seller['openid']})
        if not exists:
            op.bulk_insert(user_table, [{
                **seller,
                'campus': ref_address,
                'status': 1,
                'create_time': now,
                'update_time': now,
            }])
        else:
            conn.execute(sa.text(
                "UPDATE `user` SET campus = :campus, update_time = :now WHERE openid = :openid"
            ), {'campus': ref_address, 'now': now, 'openid': seller['openid']})

    seller_ids = {
        row['openid']: row['id']
        for row in conn.execute(sa.text(
            "SELECT id, openid FROM `user` WHERE openid IN :openids"
        ).bindparams(sa.bindparam('openids', expanding=True)), {'openids': [s['openid'] for s in SELLERS]}).mappings()
    }
    category_ids = {
        row['name']: row['id']
        for row in conn.execute(sa.text(
            "SELECT id, name FROM category WHERE name IN :names"
        ).bindparams(sa.bindparam('names', expanding=True)), {'names': list({g['category'] for g in GOODS})}).mappings()
    }

    rows = []
    for item in GOODS:
        seller_id = seller_ids.get(item['seller'])
        if not seller_id or seller_id == xizi['id']:
            continue
        exists = _scalar(conn, "SELECT id FROM goods WHERE user_id = :uid AND title = :title", {
            'uid': seller_id,
            'title': item['title'],
        })
        if exists:
            continue
        created_at = now - timedelta(minutes=item['minutes_ago'])
        rows.append({
            'user_id': seller_id,
            'category_id': category_ids.get(item['category'], 0),
            'title': item['title'],
            'description': item['description'],
            'price': Decimal(item['price']),
            'images': item['images'],
            'lat': ref_lat,
            'lng': ref_lng,
            'address': ref_address,
            'status': 1,
            'audit_status': 1,
            'view_count': item['view_count'],
            'create_time': created_at,
            'update_time': created_at,
        })
    if rows:
        op.bulk_insert(goods_table, rows)


def downgrade():
    conn = op.get_bind()
    titles = [item['title'] for item in GOODS]
    openids = [seller['openid'] for seller in SELLERS]
    seller_ids = [
        row['id']
        for row in conn.execute(sa.text(
            "SELECT id FROM `user` WHERE openid IN :openids"
        ).bindparams(sa.bindparam('openids', expanding=True)), {'openids': openids}).mappings()
    ]
    if seller_ids:
        conn.execute(sa.text(
            "DELETE FROM goods WHERE user_id IN :seller_ids AND title IN :titles"
        ).bindparams(
            sa.bindparam('seller_ids', expanding=True),
            sa.bindparam('titles', expanding=True),
        ), {'seller_ids': seller_ids, 'titles': titles})
    conn.execute(sa.text(
        "DELETE FROM `user` WHERE openid IN :openids"
    ).bindparams(sa.bindparam('openids', expanding=True)), {'openids': openids})
