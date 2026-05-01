# -*- coding: utf-8 -*-
"""
数据库模型 - 共 15 张表，对应 docs/04-数据库设计.md
"""
from datetime import datetime
from app import db


class User(db.Model):
    """用户表"""
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    openid = db.Column(db.String(64), unique=True, nullable=False)
    nick_name = db.Column(db.String(64), default='')
    avatar = db.Column(db.String(512), default='')
    phone = db.Column(db.String(20), default='')
    campus = db.Column(db.String(64), default='')
    credit_score = db.Column(db.Integer, default=100)
    status = db.Column(db.SmallInteger, default=1)  # 0 禁用 1 正常
    create_time = db.Column(db.DateTime, default=datetime.utcnow)
    update_time = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nickName': self.nick_name,
            'avatar': self.avatar,
            'phone': self.phone,
            'campus': self.campus,
            'creditScore': self.credit_score,
        }


class Admin(db.Model):
    """管理员表"""
    __tablename__ = 'admin'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(32), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    real_name = db.Column(db.String(32), default='')
    role = db.Column(db.String(16), default='admin')  # admin/super_admin
    status = db.Column(db.SmallInteger, default=1)  # 0 禁用 1 正常
    last_login_time = db.Column(db.DateTime, nullable=True)
    create_time = db.Column(db.DateTime, default=datetime.utcnow)
    update_time = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Category(db.Model):
    """商品分类表"""
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    parent_id = db.Column(db.Integer, default=0)
    name = db.Column(db.String(32), nullable=False)
    sort_order = db.Column(db.Integer, default=0)
    status = db.Column(db.SmallInteger, default=1)  # 0 禁用 1 启用
    create_time = db.Column(db.DateTime, default=datetime.utcnow)


class Goods(db.Model):
    """商品表"""
    __tablename__ = 'goods'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, default=0)  # 0 表示未分类
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    images = db.Column(db.JSON, nullable=True)  # ["url1", "url2"]
    lat = db.Column(db.Numeric(10, 7), nullable=False)
    lng = db.Column(db.Numeric(10, 7), nullable=False)
    address = db.Column(db.String(128), default='')
    status = db.Column(db.SmallInteger, default=1)  # 0 下架 1 上架 2 已售
    audit_status = db.Column(db.SmallInteger, default=0)  # 0 待审核 1 通过 2 驳回
    view_count = db.Column(db.Integer, default=0)
    create_time = db.Column(db.DateTime, default=datetime.utcnow)
    update_time = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('goods', lazy='dynamic'))

    def to_dict(self, distance=None):
        cat = Category.query.get(self.category_id) if self.category_id else None
        d = {
            'id': self.id,
            'userId': self.user_id,
            'categoryId': self.category_id,
            'category': cat.name if cat else '',
            'title': self.title,
            'description': self.description or '',
            'price': float(self.price),
            'images': self.images or [],
            'lat': float(self.lat),
            'lng': float(self.lng),
            'address': self.address or '',
            'status': self.status,
            'auditStatus': self.audit_status,
            'viewCount': self.view_count,
            'createTime': self.create_time.isoformat() if self.create_time else '',
        }
        if distance is not None:
            d['distance'] = distance
        if self.user:
            d['user'] = self.user.to_dict()
        return d


class Order(db.Model):
    """订单表（表名 order 为 MySQL 保留字，使用 orders）"""
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_no = db.Column(db.String(32), unique=True, nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    goods_id = db.Column(db.Integer, db.ForeignKey('goods.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.SmallInteger, default=0)  # 0 待确认 1 进行中 2 已完成 3 已取消
    pay_type = db.Column(db.String(16), default='')
    remark = db.Column(db.String(256), default='')
    create_time = db.Column(db.DateTime, default=datetime.utcnow)
    complete_time = db.Column(db.DateTime, nullable=True)

    buyer = db.relationship('User', foreign_keys=[buyer_id])
    seller = db.relationship('User', foreign_keys=[seller_id])
    goods = db.relationship('Goods', backref=db.backref('orders', lazy='dynamic'))


class OrderStatusLog(db.Model):
    """订单状态日志表"""
    __tablename__ = 'order_status_log'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    from_status = db.Column(db.SmallInteger, nullable=True)
    to_status = db.Column(db.SmallInteger, nullable=False)
    operator_type = db.Column(db.String(16), default='user')  # user/admin/system
    operator_id = db.Column(db.Integer, default=0)
    remark = db.Column(db.String(256), default='')
    create_time = db.Column(db.DateTime, default=datetime.utcnow)


class Conversation(db.Model):
    """会话表"""
    __tablename__ = 'conversation'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    goods_id = db.Column(db.Integer, default=0)  # 0 表示无关商品
    last_message_id = db.Column(db.Integer, default=0)
    last_message_at = db.Column(db.DateTime, nullable=True)
    user1_unread = db.Column(db.Integer, default=0)
    user2_unread = db.Column(db.Integer, default=0)
    create_time = db.Column(db.DateTime, default=datetime.utcnow)
    update_time = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Message(db.Model):
    """消息表"""
    __tablename__ = 'message'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id'), nullable=False)
    from_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    to_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    msg_type = db.Column(db.String(16), default='text')  # text/image
    extra = db.Column(db.JSON, nullable=True)
    is_read = db.Column(db.SmallInteger, default=0)  # 0 未读 1 已读
    create_time = db.Column(db.DateTime, default=datetime.utcnow)


class MessageRead(db.Model):
    """消息已读记录表"""
    __tablename__ = 'message_read'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    message_id = db.Column(db.Integer, db.ForeignKey('message.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    read_time = db.Column(db.DateTime, default=datetime.utcnow)


class Evaluation(db.Model):
    """评价表"""
    __tablename__ = 'evaluation'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    from_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    to_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role = db.Column(db.String(8), nullable=False)  # buyer/seller
    star = db.Column(db.SmallInteger, nullable=False)  # 1-5
    comment = db.Column(db.String(512), default='')
    create_time = db.Column(db.DateTime, default=datetime.utcnow)


class CreditLog(db.Model):
    """信用分变更记录表"""
    __tablename__ = 'credit_log'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    change_value = db.Column(db.Integer, nullable=False)
    before_score = db.Column(db.Integer, nullable=False)
    after_score = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(32), default='')
    ref_id = db.Column(db.Integer, default=0)
    create_time = db.Column(db.DateTime, default=datetime.utcnow)


class Report(db.Model):
    """举报表"""
    __tablename__ = 'report'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    target_type = db.Column(db.String(16), nullable=False)  # goods/user/message
    target_id = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(32), default='')
    content = db.Column(db.String(512), default='')
    status = db.Column(db.SmallInteger, default=0)  # 0 待处理 1 已处理 2 已驳回
    handler_id = db.Column(db.Integer, default=0)
    handle_remark = db.Column(db.String(256), default='')
    create_time = db.Column(db.DateTime, default=datetime.utcnow)
    handle_time = db.Column(db.DateTime, nullable=True)


class BrowseHistory(db.Model):
    """浏览历史表"""
    __tablename__ = 'browse_history'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    goods_id = db.Column(db.Integer, db.ForeignKey('goods.id'), nullable=False)
    create_time = db.Column(db.DateTime, default=datetime.utcnow)


class GoodsComment(db.Model):
    """商品评论表（商品下的留言）"""
    __tablename__ = 'goods_comment'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    goods_id = db.Column(db.Integer, db.ForeignKey('goods.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.String(512), nullable=False)
    create_time = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('goods_comments', lazy='dynamic'))
    goods = db.relationship('Goods', backref=db.backref('comments', lazy='dynamic'))


class Favorite(db.Model):
    """收藏表"""
    __tablename__ = 'favorite'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    goods_id = db.Column(db.Integer, db.ForeignKey('goods.id'), nullable=False)
    create_time = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('user_id', 'goods_id', name='uq_favorite_user_goods'),)


class Notification(db.Model):
    """系统通知表"""
    __tablename__ = 'notification'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(64), nullable=False)
    content = db.Column(db.String(512), default='')
    type = db.Column(db.String(16), default='system')  # system/order/message/report
    ref_id = db.Column(db.Integer, default=0)
    is_read = db.Column(db.SmallInteger, default=0)  # 0 未读 1 已读
    create_time = db.Column(db.DateTime, default=datetime.utcnow)


class OperationLog(db.Model):
    """管理员操作日志表"""
    __tablename__ = 'operation_log'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)
    action = db.Column(db.String(32), nullable=False)
    target_type = db.Column(db.String(16), default='')
    target_id = db.Column(db.Integer, default=0)
    detail = db.Column(db.String(512), default='')
    ip = db.Column(db.String(64), default='')
    create_time = db.Column(db.DateTime, default=datetime.utcnow)
