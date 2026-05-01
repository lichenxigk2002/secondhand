# -*- coding: utf-8 -*-
"""seed demo marketplace data

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-05-01

"""
from datetime import datetime, timedelta
from decimal import Decimal

from alembic import op
import sqlalchemy as sa

revision = 'e5f6a7b8c9d0'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


BASE_TIME = datetime(2026, 5, 1, 9, 0, 0)
DEMO_ADMIN_USERNAME = 'demo_admin'
DEMO_ADMIN_PASSWORD_HASH = (
    'scrypt:32768:8:1$dJO8V0lmq5TZm4me$'
    'c7cbde104c6967ff15d1610edaebd18ac8c594f1f9ed052d6413a8a2ab064bc372254f6381430767559f398a302001c5cf4022c445b46851fe4e396ddd07b997'
)

DEMO_USERS = [
    {
        'openid': 'dev_tourist_the code is a mock one',
        'nick_name': '林晨',
        'avatar': 'https://i.pravatar.cc/160?img=12',
        'phone': '13800010001',
        'campus': '宿舍区 3 栋',
        'credit_score': 100,
        'status': 1,
        'create_time': BASE_TIME - timedelta(days=38),
    },
    {
        'openid': 'demo_seed_xu_yiran',
        'nick_name': '许亦然',
        'avatar': 'https://i.pravatar.cc/160?img=32',
        'phone': '13800010002',
        'campus': '图书馆',
        'credit_score': 98,
        'status': 1,
        'create_time': BASE_TIME - timedelta(days=35),
    },
    {
        'openid': 'demo_seed_zhou_zhixia',
        'nick_name': '周知夏',
        'avatar': 'https://i.pravatar.cc/160?img=47',
        'phone': '13800010003',
        'campus': '宿舍区 1 栋',
        'credit_score': 99,
        'status': 1,
        'create_time': BASE_TIME - timedelta(days=31),
    },
    {
        'openid': 'demo_seed_chen_mo',
        'nick_name': '陈墨',
        'avatar': 'https://i.pravatar.cc/160?img=15',
        'phone': '13800010004',
        'campus': '宿舍区 2 栋',
        'credit_score': 96,
        'status': 1,
        'create_time': BASE_TIME - timedelta(days=27),
    },
    {
        'openid': 'demo_seed_song_yue',
        'nick_name': '宋悦',
        'avatar': 'https://i.pravatar.cc/160?img=26',
        'phone': '13800010005',
        'campus': '快递点',
        'credit_score': 97,
        'status': 1,
        'create_time': BASE_TIME - timedelta(days=22),
    },
    {
        'openid': 'demo_seed_he_nan',
        'nick_name': '何楠',
        'avatar': 'https://i.pravatar.cc/160?img=53',
        'phone': '13800010006',
        'campus': '其他 体育馆旁',
        'credit_score': 94,
        'status': 1,
        'create_time': BASE_TIME - timedelta(days=18),
    },
    {
        'openid': 'demo_seed_tang_qi',
        'nick_name': '唐琪',
        'avatar': 'https://i.pravatar.cc/160?img=5',
        'phone': '13800010007',
        'campus': '教学区 创客空间',
        'credit_score': 62,
        'status': 0,
        'create_time': BASE_TIME - timedelta(days=15),
    },
    {
        'openid': 'demo_seed_wu_tong',
        'nick_name': '吴桐',
        'avatar': 'https://i.pravatar.cc/160?img=68',
        'phone': '13800010008',
        'campus': '宿舍区 研究生公寓',
        'credit_score': 95,
        'status': 1,
        'create_time': BASE_TIME - timedelta(days=11),
    },
]

DEMO_CATEGORIES = [
    {'name': '数码', 'parent_id': 0, 'sort_order': 10, 'status': 1, 'create_time': BASE_TIME - timedelta(days=45)},
    {'name': '书籍', 'parent_id': 0, 'sort_order': 20, 'status': 1, 'create_time': BASE_TIME - timedelta(days=45)},
    {'name': '生活用品', 'parent_id': 0, 'sort_order': 30, 'status': 1, 'create_time': BASE_TIME - timedelta(days=45)},
    {'name': '服饰', 'parent_id': 0, 'sort_order': 40, 'status': 1, 'create_time': BASE_TIME - timedelta(days=45)},
    {'name': '其他', 'parent_id': 0, 'sort_order': 90, 'status': 1, 'create_time': BASE_TIME - timedelta(days=45)},
]

DEMO_GOODS = [
    {
        'title': '[演示] iPad Air 5 64G 蓝色',
        'seller': 'demo_seed_xu_yiran',
        'category': '数码',
        'description': '自用平板，屏幕无划痕，适合记笔记和看课件，带保护壳和电容笔。',
        'price': '2599.00',
        'images': [
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=900&q=80',
        ],
        'lat': '30.3132000',
        'lng': '120.3489000',
        'address': '图书馆东门',
        'status': 1,
        'audit_status': 1,
        'view_count': 128,
        'create_time': BASE_TIME - timedelta(days=9, hours=2),
    },
    {
        'title': '[演示] Sony WH-1000XM4 降噪耳机',
        'seller': 'demo_seed_zhou_zhixia',
        'category': '数码',
        'description': '功能正常，耳罩去年换过，适合自习室和通勤使用。',
        'price': '899.00',
        'images': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3216000',
        'lng': '120.3547000',
        'address': '宿舍区 1 栋楼下',
        'status': 1,
        'audit_status': 1,
        'view_count': 92,
        'create_time': BASE_TIME - timedelta(days=7, hours=4),
    },
    {
        'title': '[演示] 机械键盘 87 键热插拔',
        'seller': 'demo_seed_chen_mo',
        'category': '数码',
        'description': '茶轴，附备用键帽和拔轴器，宿舍学习办公都可以。',
        'price': '168.00',
        'images': ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3091000',
        'lng': '120.3602000',
        'address': '宿舍区 2 栋门口',
        'status': 1,
        'audit_status': 1,
        'view_count': 76,
        'create_time': BASE_TIME - timedelta(days=6, hours=1),
    },
    {
        'title': '[演示] 高等数学同济第七版教材',
        'seller': 'demo_seed_zhou_zhixia',
        'category': '书籍',
        'description': '上下册一起出，少量笔记，期末复习够用。',
        'price': '28.00',
        'images': ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3208000',
        'lng': '120.3528000',
        'address': '教学楼 A 座',
        'status': 1,
        'audit_status': 1,
        'view_count': 64,
        'create_time': BASE_TIME - timedelta(days=5, hours=5),
    },
    {
        'title': '[演示] 四六级真题和听力资料',
        'seller': 'demo_seed_song_yue',
        'category': '书籍',
        'description': '近五年真题，附听力二维码，适合考前集中练习。',
        'price': '18.00',
        'images': ['https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3054000',
        'lng': '120.3416000',
        'address': '快递点',
        'status': 1,
        'audit_status': 1,
        'view_count': 53,
        'create_time': BASE_TIME - timedelta(days=4, hours=6),
    },
    {
        'title': '[演示] 宿舍折叠桌和台灯套装',
        'seller': 'demo_seed_xu_yiran',
        'category': '生活用品',
        'description': '桌面稳，台灯三档亮度，毕业搬寝一起出。',
        'price': '45.00',
        'images': ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3140000',
        'lng': '120.3479000',
        'address': '宿舍区 3 栋楼下',
        'status': 1,
        'audit_status': 1,
        'view_count': 41,
        'create_time': BASE_TIME - timedelta(days=3, hours=8),
    },
    {
        'title': '[演示] 小型电饭煲 1.6L',
        'seller': 'demo_seed_he_nan',
        'category': '生活用品',
        'description': '可煮饭和煲汤，内胆无明显划痕，因为换新所以出。',
        'price': '69.00',
        'images': ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3009000',
        'lng': '120.3573000',
        'address': '体育馆旁生活区',
        'status': 0,
        'audit_status': 1,
        'view_count': 30,
        'create_time': BASE_TIME - timedelta(days=2, hours=7),
    },
    {
        'title': '[演示] 秋季卫衣 M 码',
        'seller': 'demo_seed_song_yue',
        'category': '服饰',
        'description': '只穿过两次，版型宽松，适合春秋季。',
        'price': '39.00',
        'images': ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3061000',
        'lng': '120.3425000',
        'address': '宿舍区 5 栋',
        'status': 1,
        'audit_status': 1,
        'view_count': 36,
        'create_time': BASE_TIME - timedelta(days=2, hours=3),
    },
    {
        'title': '[演示] 校园跑步鞋 42 码',
        'seller': 'demo_seed_chen_mo',
        'category': '服饰',
        'description': '尺码 42，跑步课穿过几次，鞋底磨损轻。',
        'price': '129.00',
        'images': ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3096000',
        'lng': '120.3608000',
        'address': '运动场看台',
        'status': 1,
        'audit_status': 1,
        'view_count': 47,
        'create_time': BASE_TIME - timedelta(days=1, hours=9),
    },
    {
        'title': '[演示] 毕业季行李箱 24寸',
        'seller': 'demo_seed_he_nan',
        'category': '其他',
        'description': '轮子顺滑，适合搬寝或短途旅行，可在体育馆附近面交。',
        'price': '88.00',
        'images': ['https://images.unsplash.com/photo-1553531888-a813b3d2feff?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3011000',
        'lng': '120.3562000',
        'address': '体育馆北门',
        'status': 1,
        'audit_status': 1,
        'view_count': 58,
        'create_time': BASE_TIME - timedelta(hours=18),
    },
    {
        'title': '[演示] 佳能入门相机套机',
        'seller': 'demo_seed_wu_tong',
        'category': '数码',
        'description': '已完成交易的示例商品，用于展示订单闭环和评价。',
        'price': '1299.00',
        'images': ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3221000',
        'lng': '120.3535000',
        'address': '研究生公寓',
        'status': 2,
        'audit_status': 1,
        'view_count': 143,
        'create_time': BASE_TIME - timedelta(days=12),
    },
    {
        'title': '[演示] Python 数据分析书籍套装',
        'seller': 'demo_seed_zhou_zhixia',
        'category': '书籍',
        'description': '已售出的书籍套装，包含 NumPy、Pandas 和可视化入门。',
        'price': '60.00',
        'images': ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3210000',
        'lng': '120.3542000',
        'address': '宿舍区 1 栋',
        'status': 2,
        'audit_status': 1,
        'view_count': 86,
        'create_time': BASE_TIME - timedelta(days=10),
    },
    {
        'title': '[演示] 待审核无人机电池',
        'seller': 'demo_seed_tang_qi',
        'category': '数码',
        'description': '后台待审核商品示例，不会出现在小程序普通商品列表。',
        'price': '220.00',
        'images': ['https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3085000',
        'lng': '120.3634000',
        'address': '教学区创客空间',
        'status': 1,
        'audit_status': 0,
        'view_count': 12,
        'create_time': BASE_TIME - timedelta(hours=9),
    },
    {
        'title': '[演示] 未通过审核的校园卡',
        'seller': 'demo_seed_tang_qi',
        'category': '其他',
        'description': '后台驳回商品示例，用于展示审核状态。',
        'price': '30.00',
        'images': ['https://images.unsplash.com/photo-1616077167599-cad3639f9cbd?auto=format&fit=crop&w=900&q=80'],
        'lat': '30.3087000',
        'lng': '120.3632000',
        'address': '教学区创客空间',
        'status': 0,
        'audit_status': 2,
        'view_count': 8,
        'create_time': BASE_TIME - timedelta(hours=6),
    },
]

DEMO_ORDERS = [
    {
        'order_no': 'DEMO202605010001',
        'buyer': 'dev_tourist_the code is a mock one',
        'seller': 'demo_seed_wu_tong',
        'goods': '[演示] 佳能入门相机套机',
        'amount': '1299.00',
        'status': 2,
        'pay_type': 'cash',
        'remark': '图书馆门口验机后当面交易。',
        'create_time': BASE_TIME - timedelta(days=8, hours=4),
        'complete_time': BASE_TIME - timedelta(days=8, hours=1),
    },
    {
        'order_no': 'DEMO202605010002',
        'buyer': 'demo_seed_song_yue',
        'seller': 'demo_seed_zhou_zhixia',
        'goods': '[演示] Python 数据分析书籍套装',
        'amount': '60.00',
        'status': 2,
        'pay_type': 'cash',
        'remark': '食堂门口自取。',
        'create_time': BASE_TIME - timedelta(days=7, hours=3),
        'complete_time': BASE_TIME - timedelta(days=7),
    },
    {
        'order_no': 'DEMO202605010003',
        'buyer': 'demo_seed_chen_mo',
        'seller': 'demo_seed_xu_yiran',
        'goods': '[演示] iPad Air 5 64G 蓝色',
        'amount': '2599.00',
        'status': 0,
        'pay_type': '',
        'remark': '买家已发起意向，等待双方确认。',
        'create_time': BASE_TIME - timedelta(hours=10),
        'complete_time': None,
    },
    {
        'order_no': 'DEMO202605010004',
        'buyer': 'dev_tourist_the code is a mock one',
        'seller': 'demo_seed_chen_mo',
        'goods': '[演示] 机械键盘 87 键热插拔',
        'amount': '168.00',
        'status': 1,
        'pay_type': '',
        'remark': '已约今晚宿舍区门口验货。',
        'create_time': BASE_TIME - timedelta(hours=7),
        'complete_time': None,
    },
    {
        'order_no': 'DEMO202605010005',
        'buyer': 'demo_seed_he_nan',
        'seller': 'demo_seed_zhou_zhixia',
        'goods': '[演示] Sony WH-1000XM4 降噪耳机',
        'amount': '899.00',
        'status': 3,
        'pay_type': '',
        'remark': '买家临时取消。',
        'create_time': BASE_TIME - timedelta(days=2),
        'complete_time': None,
    },
    {
        'order_no': 'DEMO202605010006',
        'buyer': 'demo_seed_wu_tong',
        'seller': 'demo_seed_xu_yiran',
        'goods': '[演示] 宿舍折叠桌和台灯套装',
        'amount': '45.00',
        'status': 0,
        'pay_type': '',
        'remark': '等卖家确认面交时间。',
        'create_time': BASE_TIME - timedelta(hours=5),
        'complete_time': None,
    },
]

DEMO_MESSAGE_CONVERSATIONS = [
    {
        'user_a': 'dev_tourist_the code is a mock one',
        'user_b': 'demo_seed_xu_yiran',
        'goods': '[演示] iPad Air 5 64G 蓝色',
        'messages': [
            ('dev_tourist_the code is a mock one', 'demo_seed_xu_yiran', '你好，iPad 还能再看一下电池健康吗？', 1, 260),
            ('demo_seed_xu_yiran', 'dev_tourist_the code is a mock one', '可以，今晚 7 点图书馆东门方便吗？', 1, 245),
            ('dev_tourist_the code is a mock one', 'demo_seed_xu_yiran', '方便，我带电脑现场试一下。', 0, 18),
        ],
    },
    {
        'user_a': 'dev_tourist_the code is a mock one',
        'user_b': 'demo_seed_chen_mo',
        'goods': '[演示] 机械键盘 87 键热插拔',
        'messages': [
            ('dev_tourist_the code is a mock one', 'demo_seed_chen_mo', '键盘有原包装吗？', 1, 420),
            ('demo_seed_chen_mo', 'dev_tourist_the code is a mock one', '盒子还在，备用键帽也都在。', 1, 408),
            ('demo_seed_chen_mo', 'dev_tourist_the code is a mock one', '今晚宿舍区门口见，我带上测试线。', 0, 22),
        ],
    },
    {
        'user_a': 'demo_seed_song_yue',
        'user_b': 'demo_seed_zhou_zhixia',
        'goods': '[演示] Python 数据分析书籍套装',
        'messages': [
            ('demo_seed_song_yue', 'demo_seed_zhou_zhixia', '书籍套装还在吗？', 1, 980),
            ('demo_seed_zhou_zhixia', 'demo_seed_song_yue', '在的，Pandas 那本几乎全新。', 1, 960),
            ('demo_seed_song_yue', 'demo_seed_zhou_zhixia', '已完成交易，谢谢！', 1, 820),
        ],
    },
    {
        'user_a': 'demo_seed_wu_tong',
        'user_b': 'demo_seed_xu_yiran',
        'goods': '[演示] 宿舍折叠桌和台灯套装',
        'messages': [
            ('demo_seed_wu_tong', 'demo_seed_xu_yiran', '折叠桌能放 14 寸电脑吗？', 1, 180),
            ('demo_seed_xu_yiran', 'demo_seed_wu_tong', '可以，桌面宽 60cm。', 0, 35),
        ],
    },
    {
        'user_a': 'demo_seed_he_nan',
        'user_b': 'demo_seed_zhou_zhixia',
        'goods': '[演示] Sony WH-1000XM4 降噪耳机',
        'messages': [
            ('demo_seed_he_nan', 'demo_seed_zhou_zhixia', '耳机最低多少？', 1, 3200),
            ('demo_seed_zhou_zhixia', 'demo_seed_he_nan', '最低 850，功能都正常。', 1, 3188),
            ('demo_seed_he_nan', 'demo_seed_zhou_zhixia', '先不用了，我这边预算不够。', 1, 3000),
        ],
    },
]

DEMO_FAVORITES = [
    ('dev_tourist_the code is a mock one', '[演示] iPad Air 5 64G 蓝色', 410),
    ('dev_tourist_the code is a mock one', '[演示] 宿舍折叠桌和台灯套装', 360),
    ('dev_tourist_the code is a mock one', '[演示] 校园跑步鞋 42 码', 300),
    ('demo_seed_chen_mo', '[演示] Sony WH-1000XM4 降噪耳机', 260),
    ('demo_seed_chen_mo', '[演示] 高等数学同济第七版教材', 220),
    ('demo_seed_song_yue', '[演示] iPad Air 5 64G 蓝色', 180),
    ('demo_seed_song_yue', '[演示] 毕业季行李箱 24寸', 150),
    ('demo_seed_wu_tong', '[演示] 机械键盘 87 键热插拔', 120),
]

DEMO_BROWSE_HISTORY = [
    ('dev_tourist_the code is a mock one', '[演示] iPad Air 5 64G 蓝色', 95),
    ('dev_tourist_the code is a mock one', '[演示] 机械键盘 87 键热插拔', 85),
    ('dev_tourist_the code is a mock one', '[演示] 高等数学同济第七版教材', 75),
    ('demo_seed_chen_mo', '[演示] Sony WH-1000XM4 降噪耳机', 70),
    ('demo_seed_chen_mo', '[演示] iPad Air 5 64G 蓝色', 62),
    ('demo_seed_song_yue', '[演示] 毕业季行李箱 24寸', 55),
    ('demo_seed_song_yue', '[演示] 秋季卫衣 M 码', 51),
    ('demo_seed_he_nan', '[演示] 四六级真题和听力资料', 48),
    ('demo_seed_wu_tong', '[演示] 宿舍折叠桌和台灯套装', 42),
]

DEMO_GOODS_COMMENTS = [
    ('demo_seed_chen_mo', '[演示] iPad Air 5 64G 蓝色', '支持现场验机吗？主要想看屏幕和电池。', 180),
    ('demo_seed_song_yue', '[演示] iPad Air 5 64G 蓝色', '保护壳可以一起送吗？', 160),
    ('dev_tourist_the code is a mock one', '[演示] 高等数学同济第七版教材', '请问上下册笔记多吗？', 145),
    ('demo_seed_wu_tong', '[演示] 宿舍折叠桌和台灯套装', '台灯充电线还在吗？', 132),
    ('demo_seed_he_nan', '[演示] 校园跑步鞋 42 码', '鞋码偏大还是正常？', 118),
    ('demo_seed_xu_yiran', '[演示] 毕业季行李箱 24寸', '轮子声音大不大？', 90),
]


def _table(name, columns):
    return sa.table(name, *[sa.column(col, typ) for col, typ in columns])


admin_table = _table('admin', [
    ('username', sa.String(32)),
    ('password', sa.String(255)),
    ('real_name', sa.String(32)),
    ('role', sa.String(16)),
    ('status', sa.SmallInteger()),
    ('last_login_time', sa.DateTime()),
    ('create_time', sa.DateTime()),
    ('update_time', sa.DateTime()),
])
user_table = _table('user', [
    ('openid', sa.String(64)),
    ('nick_name', sa.String(64)),
    ('avatar', sa.String(512)),
    ('phone', sa.String(20)),
    ('campus', sa.String(64)),
    ('credit_score', sa.Integer()),
    ('status', sa.SmallInteger()),
    ('create_time', sa.DateTime()),
    ('update_time', sa.DateTime()),
])
category_table = _table('category', [
    ('parent_id', sa.Integer()),
    ('name', sa.String(32)),
    ('sort_order', sa.Integer()),
    ('status', sa.SmallInteger()),
    ('create_time', sa.DateTime()),
])
goods_table = _table('goods', [
    ('user_id', sa.Integer()),
    ('category_id', sa.Integer()),
    ('title', sa.String(128)),
    ('description', sa.Text()),
    ('price', sa.Numeric(10, 2)),
    ('images', sa.JSON()),
    ('lat', sa.Numeric(10, 7)),
    ('lng', sa.Numeric(10, 7)),
    ('address', sa.String(128)),
    ('status', sa.SmallInteger()),
    ('audit_status', sa.SmallInteger()),
    ('view_count', sa.Integer()),
    ('create_time', sa.DateTime()),
    ('update_time', sa.DateTime()),
])
order_table = _table('orders', [
    ('order_no', sa.String(32)),
    ('buyer_id', sa.Integer()),
    ('seller_id', sa.Integer()),
    ('goods_id', sa.Integer()),
    ('amount', sa.Numeric(10, 2)),
    ('status', sa.SmallInteger()),
    ('pay_type', sa.String(16)),
    ('remark', sa.String(256)),
    ('create_time', sa.DateTime()),
    ('complete_time', sa.DateTime()),
])
order_status_log_table = _table('order_status_log', [
    ('order_id', sa.Integer()),
    ('from_status', sa.SmallInteger()),
    ('to_status', sa.SmallInteger()),
    ('operator_type', sa.String(16)),
    ('operator_id', sa.Integer()),
    ('remark', sa.String(256)),
    ('create_time', sa.DateTime()),
])
conversation_table = _table('conversation', [
    ('user1_id', sa.Integer()),
    ('user2_id', sa.Integer()),
    ('goods_id', sa.Integer()),
    ('last_message_id', sa.Integer()),
    ('last_message_at', sa.DateTime()),
    ('user1_unread', sa.Integer()),
    ('user2_unread', sa.Integer()),
    ('create_time', sa.DateTime()),
    ('update_time', sa.DateTime()),
])
message_table = _table('message', [
    ('conversation_id', sa.Integer()),
    ('from_user_id', sa.Integer()),
    ('to_user_id', sa.Integer()),
    ('content', sa.Text()),
    ('msg_type', sa.String(16)),
    ('extra', sa.JSON()),
    ('is_read', sa.SmallInteger()),
    ('create_time', sa.DateTime()),
])
message_read_table = _table('message_read', [
    ('message_id', sa.Integer()),
    ('user_id', sa.Integer()),
    ('read_time', sa.DateTime()),
])
evaluation_table = _table('evaluation', [
    ('order_id', sa.Integer()),
    ('from_user_id', sa.Integer()),
    ('to_user_id', sa.Integer()),
    ('role', sa.String(8)),
    ('star', sa.SmallInteger()),
    ('comment', sa.String(512)),
    ('create_time', sa.DateTime()),
])
credit_log_table = _table('credit_log', [
    ('user_id', sa.Integer()),
    ('change_value', sa.Integer()),
    ('before_score', sa.Integer()),
    ('after_score', sa.Integer()),
    ('reason', sa.String(32)),
    ('ref_id', sa.Integer()),
    ('create_time', sa.DateTime()),
])
report_table = _table('report', [
    ('reporter_id', sa.Integer()),
    ('target_type', sa.String(16)),
    ('target_id', sa.Integer()),
    ('reason', sa.String(32)),
    ('content', sa.String(512)),
    ('status', sa.SmallInteger()),
    ('handler_id', sa.Integer()),
    ('handle_remark', sa.String(256)),
    ('create_time', sa.DateTime()),
    ('handle_time', sa.DateTime()),
])
favorite_table = _table('favorite', [
    ('user_id', sa.Integer()),
    ('goods_id', sa.Integer()),
    ('create_time', sa.DateTime()),
])
browse_history_table = _table('browse_history', [
    ('user_id', sa.Integer()),
    ('goods_id', sa.Integer()),
    ('create_time', sa.DateTime()),
])
goods_comment_table = _table('goods_comment', [
    ('goods_id', sa.Integer()),
    ('user_id', sa.Integer()),
    ('content', sa.String(512)),
    ('create_time', sa.DateTime()),
])
notification_table = _table('notification', [
    ('user_id', sa.Integer()),
    ('title', sa.String(64)),
    ('content', sa.String(512)),
    ('type', sa.String(16)),
    ('ref_id', sa.Integer()),
    ('is_read', sa.SmallInteger()),
    ('create_time', sa.DateTime()),
])
operation_log_table = _table('operation_log', [
    ('admin_id', sa.Integer()),
    ('action', sa.String(32)),
    ('target_type', sa.String(16)),
    ('target_id', sa.Integer()),
    ('detail', sa.String(512)),
    ('ip', sa.String(64)),
    ('create_time', sa.DateTime()),
])


def _ids_by(conn, table_name, key_column, values):
    values = [v for v in values if v is not None]
    if not values:
        return {}
    stmt = (
        sa.text(f"SELECT id, `{key_column}` AS lookup_key FROM `{table_name}` WHERE `{key_column}` IN :values")
        .bindparams(sa.bindparam('values', expanding=True))
    )
    rows = conn.execute(stmt, {'values': values}).mappings().all()
    return {row['lookup_key']: row['id'] for row in rows}


def _bulk_insert_missing(conn, table_name, table, key_column, rows):
    existing = _ids_by(conn, table_name, key_column, [row[key_column] for row in rows])
    missing = [row for row in rows if row[key_column] not in existing]
    if missing:
        op.bulk_insert(table, missing)
    return _ids_by(conn, table_name, key_column, [row[key_column] for row in rows])


def _exists(conn, sql, params):
    return conn.execute(sa.text(sql), params).first() is not None


def _delete_in(conn, sql, param_name, values):
    values = list(values)
    if not values:
        return
    stmt = sa.text(sql).bindparams(sa.bindparam(param_name, expanding=True))
    conn.execute(stmt, {param_name: values})


def _ensure_conversation(conn, user_ids, goods_ids, spec):
    user1_id, user2_id = sorted([user_ids[spec['user_a']], user_ids[spec['user_b']]])
    row = conn.execute(
        sa.text('SELECT id FROM conversation WHERE user1_id = :user1_id AND user2_id = :user2_id'),
        {'user1_id': user1_id, 'user2_id': user2_id},
    ).first()
    if row:
        return row[0], user1_id, user2_id

    now = BASE_TIME - timedelta(minutes=spec['messages'][0][4] + 5)
    op.bulk_insert(conversation_table, [{
        'user1_id': user1_id,
        'user2_id': user2_id,
        'goods_id': goods_ids[spec['goods']],
        'last_message_id': 0,
        'last_message_at': None,
        'user1_unread': 0,
        'user2_unread': 0,
        'create_time': now,
        'update_time': now,
    }])
    return conn.execute(
        sa.text('SELECT id FROM conversation WHERE user1_id = :user1_id AND user2_id = :user2_id'),
        {'user1_id': user1_id, 'user2_id': user2_id},
    ).scalar_one(), user1_id, user2_id


def _insert_pair_rows(conn, table, table_name, first_col, second_col, rows):
    for row in rows:
        if not _exists(
            conn,
            f'SELECT id FROM `{table_name}` WHERE `{first_col}` = :first_value AND `{second_col}` = :second_value',
            {'first_value': row[first_col], 'second_value': row[second_col]},
        ):
            op.bulk_insert(table, [row])


def upgrade():
    conn = op.get_bind()

    _bulk_insert_missing(conn, 'admin', admin_table, 'username', [{
        'username': DEMO_ADMIN_USERNAME,
        'password': DEMO_ADMIN_PASSWORD_HASH,
        'real_name': '演示审核员',
        'role': 'admin',
        'status': 1,
        'last_login_time': None,
        'create_time': BASE_TIME - timedelta(days=45),
        'update_time': BASE_TIME - timedelta(days=45),
    }])
    admin_ids = _ids_by(conn, 'admin', 'username', [DEMO_ADMIN_USERNAME])
    demo_admin_id = admin_ids[DEMO_ADMIN_USERNAME]

    user_rows = [{**row, 'update_time': row['create_time']} for row in DEMO_USERS]
    user_ids = _bulk_insert_missing(conn, 'user', user_table, 'openid', user_rows)

    category_ids = _bulk_insert_missing(conn, 'category', category_table, 'name', DEMO_CATEGORIES)

    goods_rows = []
    for item in DEMO_GOODS:
        goods_rows.append({
            'user_id': user_ids[item['seller']],
            'category_id': category_ids[item['category']],
            'title': item['title'],
            'description': item['description'],
            'price': Decimal(item['price']),
            'images': item['images'],
            'lat': Decimal(item['lat']),
            'lng': Decimal(item['lng']),
            'address': item['address'],
            'status': item['status'],
            'audit_status': item['audit_status'],
            'view_count': item['view_count'],
            'create_time': item['create_time'],
            'update_time': item['create_time'] + timedelta(hours=1),
        })
    goods_ids = _bulk_insert_missing(conn, 'goods', goods_table, 'title', goods_rows)

    order_rows = []
    for item in DEMO_ORDERS:
        order_rows.append({
            'order_no': item['order_no'],
            'buyer_id': user_ids[item['buyer']],
            'seller_id': user_ids[item['seller']],
            'goods_id': goods_ids[item['goods']],
            'amount': Decimal(item['amount']),
            'status': item['status'],
            'pay_type': item['pay_type'],
            'remark': item['remark'],
            'create_time': item['create_time'],
            'complete_time': item['complete_time'],
        })
    order_ids = _bulk_insert_missing(conn, 'orders', order_table, 'order_no', order_rows)

    status_logs = []
    for item in DEMO_ORDERS:
        order_id = order_ids[item['order_no']]
        status_logs.append({
            'order_id': order_id,
            'from_status': None,
            'to_status': 0,
            'operator_type': 'user',
            'operator_id': user_ids[item['buyer']],
            'remark': '[演示数据] 买家发起意向订单',
            'create_time': item['create_time'],
        })
        if item['status'] in (1, 2):
            status_logs.append({
                'order_id': order_id,
                'from_status': 0,
                'to_status': 1,
                'operator_type': 'user',
                'operator_id': user_ids[item['seller']],
                'remark': '[演示数据] 卖家确认交易',
                'create_time': item['create_time'] + timedelta(minutes=20),
            })
        if item['status'] == 2:
            status_logs.append({
                'order_id': order_id,
                'from_status': 1,
                'to_status': 2,
                'operator_type': 'user',
                'operator_id': user_ids[item['buyer']],
                'remark': '[演示数据] 双方完成面交',
                'create_time': item['complete_time'],
            })
        if item['status'] == 3:
            status_logs.append({
                'order_id': order_id,
                'from_status': 0,
                'to_status': 3,
                'operator_type': 'user',
                'operator_id': user_ids[item['buyer']],
                'remark': '[演示数据] 买家取消意向',
                'create_time': item['create_time'] + timedelta(minutes=30),
            })
    for row in status_logs:
        if not _exists(
            conn,
            'SELECT id FROM order_status_log WHERE order_id = :order_id AND to_status = :to_status AND remark = :remark',
            row,
        ):
            op.bulk_insert(order_status_log_table, [row])

    evaluation_rows = [
        {
            'order_id': order_ids['DEMO202605010001'],
            'from_user_id': user_ids['dev_tourist_the code is a mock one'],
            'to_user_id': user_ids['demo_seed_wu_tong'],
            'role': 'buyer',
            'star': 5,
            'comment': '[演示] 相机保存很好，现场验机顺利。',
            'create_time': BASE_TIME - timedelta(days=7, hours=18),
        },
        {
            'order_id': order_ids['DEMO202605010001'],
            'from_user_id': user_ids['demo_seed_wu_tong'],
            'to_user_id': user_ids['dev_tourist_the code is a mock one'],
            'role': 'seller',
            'star': 5,
            'comment': '[演示] 买家准时，沟通清楚。',
            'create_time': BASE_TIME - timedelta(days=7, hours=17),
        },
        {
            'order_id': order_ids['DEMO202605010002'],
            'from_user_id': user_ids['demo_seed_song_yue'],
            'to_user_id': user_ids['demo_seed_zhou_zhixia'],
            'role': 'buyer',
            'star': 4,
            'comment': '[演示] 书况和描述一致，资料很全。',
            'create_time': BASE_TIME - timedelta(days=6, hours=12),
        },
        {
            'order_id': order_ids['DEMO202605010002'],
            'from_user_id': user_ids['demo_seed_zhou_zhixia'],
            'to_user_id': user_ids['demo_seed_song_yue'],
            'role': 'seller',
            'star': 5,
            'comment': '[演示] 交易很爽快，推荐。',
            'create_time': BASE_TIME - timedelta(days=6, hours=10),
        },
    ]
    for row in evaluation_rows:
        if not _exists(
            conn,
            'SELECT id FROM evaluation WHERE order_id = :order_id AND from_user_id = :from_user_id AND to_user_id = :to_user_id',
            row,
        ):
            op.bulk_insert(evaluation_table, [row])

    evaluation_ids = _ids_by(conn, 'evaluation', 'comment', [row['comment'] for row in evaluation_rows])
    credit_logs = [
        (user_ids['demo_seed_wu_tong'], 2, 93, 95, '[演示] 相机保存很好，现场验机顺利。', BASE_TIME - timedelta(days=7, hours=18)),
        (user_ids['dev_tourist_the code is a mock one'], 2, 98, 100, '[演示] 买家准时，沟通清楚。', BASE_TIME - timedelta(days=7, hours=17)),
        (user_ids['demo_seed_zhou_zhixia'], 1, 98, 99, '[演示] 书况和描述一致，资料很全。', BASE_TIME - timedelta(days=6, hours=12)),
        (user_ids['demo_seed_song_yue'], 2, 95, 97, '[演示] 交易很爽快，推荐。', BASE_TIME - timedelta(days=6, hours=10)),
    ]
    for user_id, delta, before, after, comment, created_at in credit_logs:
        row = {
            'user_id': user_id,
            'change_value': delta,
            'before_score': before,
            'after_score': after,
            'reason': '演示评价',
            'ref_id': evaluation_ids[comment],
            'create_time': created_at,
        }
        if not _exists(
            conn,
            'SELECT id FROM credit_log WHERE user_id = :user_id AND reason = :reason AND ref_id = :ref_id',
            row,
        ):
            op.bulk_insert(credit_log_table, [row])

    for spec in DEMO_MESSAGE_CONVERSATIONS:
        conversation_id, user1_id, user2_id = _ensure_conversation(conn, user_ids, goods_ids, spec)
        last_message_id = 0
        last_message_at = None
        user1_unread = 0
        user2_unread = 0
        for from_openid, to_openid, content, is_read, minutes_ago in spec['messages']:
            created_at = BASE_TIME - timedelta(minutes=minutes_ago)
            row = {
                'conversation_id': conversation_id,
                'from_user_id': user_ids[from_openid],
                'to_user_id': user_ids[to_openid],
                'content': content,
                'msg_type': 'text',
                'extra': None,
                'is_read': is_read,
                'create_time': created_at,
            }
            if not _exists(
                conn,
                'SELECT id FROM message WHERE conversation_id = :conversation_id AND content = :content',
                row,
            ):
                op.bulk_insert(message_table, [row])
            message_id = conn.execute(
                sa.text('SELECT id FROM message WHERE conversation_id = :conversation_id AND content = :content'),
                {'conversation_id': conversation_id, 'content': content},
            ).scalar_one()
            if is_read:
                read_row = {
                    'message_id': message_id,
                    'user_id': user_ids[to_openid],
                    'read_time': created_at + timedelta(minutes=3),
                }
                if not _exists(
                    conn,
                    'SELECT id FROM message_read WHERE message_id = :message_id AND user_id = :user_id',
                    read_row,
                ):
                    op.bulk_insert(message_read_table, [read_row])
            else:
                if user_ids[to_openid] == user1_id:
                    user1_unread += 1
                elif user_ids[to_openid] == user2_id:
                    user2_unread += 1
            if last_message_at is None or created_at > last_message_at:
                last_message_at = created_at
                last_message_id = message_id
        conn.execute(
            sa.text(
                'UPDATE conversation '
                'SET goods_id = :goods_id, last_message_id = :last_message_id, last_message_at = :last_message_at, '
                'user1_unread = :user1_unread, user2_unread = :user2_unread, update_time = :last_message_at '
                'WHERE id = :conversation_id'
            ),
            {
                'goods_id': goods_ids[spec['goods']],
                'last_message_id': last_message_id,
                'last_message_at': last_message_at,
                'user1_unread': user1_unread,
                'user2_unread': user2_unread,
                'conversation_id': conversation_id,
            },
        )

    favorite_rows = [
        {'user_id': user_ids[openid], 'goods_id': goods_ids[title], 'create_time': BASE_TIME - timedelta(minutes=minutes)}
        for openid, title, minutes in DEMO_FAVORITES
    ]
    _insert_pair_rows(conn, favorite_table, 'favorite', 'user_id', 'goods_id', favorite_rows)

    browse_rows = [
        {'user_id': user_ids[openid], 'goods_id': goods_ids[title], 'create_time': BASE_TIME - timedelta(minutes=minutes)}
        for openid, title, minutes in DEMO_BROWSE_HISTORY
    ]
    for row in browse_rows:
        if not _exists(
            conn,
            'SELECT id FROM browse_history WHERE user_id = :user_id AND goods_id = :goods_id AND create_time = :create_time',
            row,
        ):
            op.bulk_insert(browse_history_table, [row])

    comment_rows = [
        {
            'user_id': user_ids[openid],
            'goods_id': goods_ids[title],
            'content': content,
            'create_time': BASE_TIME - timedelta(minutes=minutes),
        }
        for openid, title, content, minutes in DEMO_GOODS_COMMENTS
    ]
    for row in comment_rows:
        if not _exists(
            conn,
            'SELECT id FROM goods_comment WHERE user_id = :user_id AND goods_id = :goods_id AND content = :content',
            row,
        ):
            op.bulk_insert(goods_comment_table, [row])

    reports = [
        {
            'reporter_id': user_ids['dev_tourist_the code is a mock one'],
            'target_type': 'goods',
            'target_id': goods_ids['[演示] 待审核无人机电池'],
            'reason': '违规内容',
            'content': '[演示数据] 商品信息里缺少电池来源说明，请后台审核。',
            'status': 0,
            'handler_id': 0,
            'handle_remark': '',
            'create_time': BASE_TIME - timedelta(hours=3),
            'handle_time': None,
        },
        {
            'reporter_id': user_ids['demo_seed_song_yue'],
            'target_type': 'goods',
            'target_id': goods_ids['[演示] 未通过审核的校园卡'],
            'reason': '违规内容',
            'content': '[演示数据] 疑似违规转让校园卡。',
            'status': 1,
            'handler_id': demo_admin_id,
            'handle_remark': '已驳回相关商品并记录。',
            'create_time': BASE_TIME - timedelta(days=1, hours=5),
            'handle_time': BASE_TIME - timedelta(days=1, hours=4),
        },
        {
            'reporter_id': user_ids['demo_seed_chen_mo'],
            'target_type': 'user',
            'target_id': user_ids['demo_seed_tang_qi'],
            'reason': '欺诈行为',
            'content': '[演示数据] 多次发布可疑商品，等待平台复核。',
            'status': 2,
            'handler_id': demo_admin_id,
            'handle_remark': '证据不足，暂不处理。',
            'create_time': BASE_TIME - timedelta(days=2, hours=6),
            'handle_time': BASE_TIME - timedelta(days=2, hours=5),
        },
    ]
    for row in reports:
        if not _exists(
            conn,
            'SELECT id FROM report WHERE reporter_id = :reporter_id AND target_type = :target_type AND target_id = :target_id AND content = :content',
            row,
        ):
            op.bulk_insert(report_table, [row])

    notifications = [
        {
            'user_id': user_ids['dev_tourist_the code is a mock one'],
            'title': '交易提醒',
            'content': '[演示数据] 机械键盘订单已进入进行中，请按约定时间面交。',
            'type': 'order',
            'ref_id': order_ids['DEMO202605010004'],
            'is_read': 0,
            'create_time': BASE_TIME - timedelta(minutes=24),
        },
        {
            'user_id': user_ids['demo_seed_xu_yiran'],
            'title': '新的咨询',
            'content': '[演示数据] 林晨咨询了你的 iPad Air。',
            'type': 'message',
            'ref_id': goods_ids['[演示] iPad Air 5 64G 蓝色'],
            'is_read': 0,
            'create_time': BASE_TIME - timedelta(minutes=18),
        },
        {
            'user_id': user_ids['demo_seed_tang_qi'],
            'title': '审核结果',
            'content': '[演示数据] 你的校园卡商品未通过审核。',
            'type': 'report',
            'ref_id': goods_ids['[演示] 未通过审核的校园卡'],
            'is_read': 1,
            'create_time': BASE_TIME - timedelta(days=1, hours=4),
        },
    ]
    for row in notifications:
        if not _exists(
            conn,
            'SELECT id FROM notification WHERE user_id = :user_id AND title = :title AND content = :content',
            row,
        ):
            op.bulk_insert(notification_table, [row])

    operation_logs = [
        ('login', 'admin', demo_admin_id, '[演示数据] 管理员登录后台', BASE_TIME - timedelta(hours=4)),
        ('goods_audit', 'goods', goods_ids['[演示] 未通过审核的校园卡'], '[演示数据] 驳回违规商品', BASE_TIME - timedelta(days=1, hours=4)),
        ('report_handle', 'report', 0, '[演示数据] 处理校园卡相关举报', BASE_TIME - timedelta(days=1, hours=4)),
        ('user_status', 'user', user_ids['demo_seed_tang_qi'], '[演示数据] 禁用异常用户', BASE_TIME - timedelta(hours=2)),
        ('category_update', 'category', category_ids['数码'], '[演示数据] 调整数码分类排序', BASE_TIME - timedelta(hours=1)),
    ]
    for action, target_type, target_id, detail, created_at in operation_logs:
        row = {
            'admin_id': demo_admin_id,
            'action': action,
            'target_type': target_type,
            'target_id': target_id,
            'detail': detail,
            'ip': '127.0.0.1',
            'create_time': created_at,
        }
        if not _exists(
            conn,
            'SELECT id FROM operation_log WHERE admin_id = :admin_id AND action = :action AND detail = :detail',
            row,
        ):
            op.bulk_insert(operation_log_table, [row])


def downgrade():
    conn = op.get_bind()
    demo_openids = [row['openid'] for row in DEMO_USERS]
    demo_goods_titles = [row['title'] for row in DEMO_GOODS]
    demo_order_nos = [row['order_no'] for row in DEMO_ORDERS]
    demo_message_contents = [message[2] for spec in DEMO_MESSAGE_CONVERSATIONS for message in spec['messages']]
    demo_comment_contents = [row[2] for row in DEMO_GOODS_COMMENTS]

    user_ids = set(_ids_by(conn, 'user', 'openid', demo_openids).values())
    goods_ids = set(_ids_by(conn, 'goods', 'title', demo_goods_titles).values())
    order_ids = set(_ids_by(conn, 'orders', 'order_no', demo_order_nos).values())
    message_ids = set(_ids_by(conn, 'message', 'content', demo_message_contents).values())
    admin_ids = set(_ids_by(conn, 'admin', 'username', [DEMO_ADMIN_USERNAME]).values())

    _delete_in(conn, 'DELETE FROM message_read WHERE message_id IN :ids', 'ids', message_ids)
    _delete_in(conn, 'DELETE FROM message WHERE id IN :ids', 'ids', message_ids)

    if user_ids:
        conversation_rows = conn.execute(
            sa.text(
                'SELECT id FROM conversation WHERE user1_id IN :ids OR user2_id IN :ids'
            ).bindparams(sa.bindparam('ids', expanding=True)),
            {'ids': list(user_ids)},
        ).scalars().all()
        for conversation_id in conversation_rows:
            remaining = conn.execute(
                sa.text('SELECT COUNT(*) FROM message WHERE conversation_id = :conversation_id'),
                {'conversation_id': conversation_id},
            ).scalar_one()
            if remaining == 0:
                conn.execute(sa.text('DELETE FROM conversation WHERE id = :conversation_id'), {'conversation_id': conversation_id})

    _delete_in(conn, 'DELETE FROM goods_comment WHERE content IN :contents', 'contents', demo_comment_contents)
    if user_ids:
        _delete_in(conn, 'DELETE FROM favorite WHERE user_id IN :ids', 'ids', user_ids)
        _delete_in(conn, 'DELETE FROM browse_history WHERE user_id IN :ids', 'ids', user_ids)
        _delete_in(conn, "DELETE FROM notification WHERE user_id IN :ids AND content LIKE '[演示数据]%'", 'ids', user_ids)
        _delete_in(conn, "DELETE FROM report WHERE reporter_id IN :ids AND content LIKE '[演示数据]%'", 'ids', user_ids)
        _delete_in(conn, "DELETE FROM credit_log WHERE user_id IN :ids AND reason = '演示评价'", 'ids', user_ids)
    if goods_ids:
        _delete_in(conn, 'DELETE FROM favorite WHERE goods_id IN :ids', 'ids', goods_ids)
        _delete_in(conn, 'DELETE FROM browse_history WHERE goods_id IN :ids', 'ids', goods_ids)
        _delete_in(conn, 'DELETE FROM goods_comment WHERE goods_id IN :ids', 'ids', goods_ids)
        _delete_in(conn, "DELETE FROM notification WHERE ref_id IN :ids AND content LIKE '[演示数据]%'", 'ids', goods_ids)
        _delete_in(conn, "DELETE FROM report WHERE target_type = 'goods' AND target_id IN :ids AND content LIKE '[演示数据]%'", 'ids', goods_ids)
    if admin_ids:
        _delete_in(conn, "DELETE FROM operation_log WHERE admin_id IN :ids AND detail LIKE '[演示数据]%'", 'ids', admin_ids)

    _delete_in(conn, 'DELETE FROM evaluation WHERE order_id IN :ids', 'ids', order_ids)
    _delete_in(conn, 'DELETE FROM order_status_log WHERE order_id IN :ids', 'ids', order_ids)
    _delete_in(conn, 'DELETE FROM orders WHERE id IN :ids', 'ids', order_ids)
    _delete_in(conn, 'DELETE FROM goods WHERE id IN :ids', 'ids', goods_ids)

    if user_ids:
        _delete_in(conn, "DELETE FROM report WHERE target_type = 'user' AND target_id IN :ids AND content LIKE '[演示数据]%'", 'ids', user_ids)

    seeded_user_times = [row['create_time'] for row in DEMO_USERS]
    if demo_openids:
        stmt = (
            sa.text('DELETE FROM `user` WHERE openid IN :openids AND create_time IN :created_times')
            .bindparams(sa.bindparam('openids', expanding=True))
            .bindparams(sa.bindparam('created_times', expanding=True))
        )
        conn.execute(stmt, {'openids': demo_openids, 'created_times': seeded_user_times})

    if admin_ids:
        _delete_in(conn, "DELETE FROM admin WHERE username IN :usernames", 'usernames', [DEMO_ADMIN_USERNAME])

    category_names = [row['name'] for row in DEMO_CATEGORIES]
    category_rows = conn.execute(
        sa.text(
            'SELECT id FROM category '
            'WHERE name IN :names AND create_time = :create_time'
        ).bindparams(sa.bindparam('names', expanding=True)),
        {'names': category_names, 'create_time': DEMO_CATEGORIES[0]['create_time']},
    ).scalars().all()
    for category_id in category_rows:
        goods_count = conn.execute(
            sa.text('SELECT COUNT(*) FROM goods WHERE category_id = :category_id'),
            {'category_id': category_id},
        ).scalar_one()
        if goods_count == 0:
            conn.execute(sa.text('DELETE FROM category WHERE id = :category_id'), {'category_id': category_id})
