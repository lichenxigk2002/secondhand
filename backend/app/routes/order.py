# -*- coding: utf-8 -*-
import time
import random
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Order, Goods, User
from .user import get_current_user

order_bp = Blueprint('order', __name__)


def _order_no():
    return 'O' + str(int(time.time() * 1000)) + str(random.randint(100, 999))


@order_bp.route('/mine', methods=['GET'])
def my_orders():
    """我的订单"""
    try:
        user = get_current_user()
        if not user:
            return {'message': '未登录'}, 401
        role = request.args.get('role')  # buyer / seller
        status = request.args.get('status', type=int)
        q = db.session.query(Order).filter(
            (Order.buyer_id == user.id) | (Order.seller_id == user.id)
        )
        if role == 'buyer':
            q = q.filter(Order.buyer_id == user.id)
        elif role == 'seller':
            q = q.filter(Order.seller_id == user.id)
        if status is not None:
            q = q.filter(Order.status == status)
        orders = q.order_by(Order.create_time.desc()).limit(50).all()
        result = [_order_to_dict(o, user.id) for o in orders]
        return {'list': result}
    except Exception as e:
        current_app.logger.exception('my_orders error')
        return jsonify(message=f'服务器错误: {str(e)}'), 500


@order_bp.route('/create', methods=['POST'])
def create_order():
    """创建意向订单（联系卖家时）"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    data = request.get_json() or {}
    goods_id = data.get('goodsId') or data.get('goods_id')
    if not goods_id:
        return {'message': '缺少 goodsId'}, 400
    g = Goods.query.get(goods_id)
    if not g:
        return {'message': '商品不存在'}, 404
    if g.status != 1 or g.audit_status != 1:
        return {'message': '该商品当前不可下单'}, 400
    if g.user_id == user.id:
        return {'message': '不能购买自己的商品'}, 400
    existing = Order.query.filter(
        Order.buyer_id == user.id,
        Order.seller_id == g.user_id,
        Order.goods_id == g.id,
        Order.status.in_([0, 1]),
    ).first()
    if existing:
        return {'order': _order_to_dict(existing, user.id)}
    o = Order(
        order_no=_order_no(),
        buyer_id=user.id,
        seller_id=g.user_id,
        goods_id=g.id,
        amount=g.price,
        status=0,
    )
    db.session.add(o)
    db.session.commit()
    return {'order': _order_to_dict(o, user.id)}


@order_bp.route('/<int:oid>/send', methods=['PUT'])
def send_order(oid):
    """卖家确认发出"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    o = Order.query.get(oid)
    if not o:
        return {'message': '订单不存在'}, 404
    if o.seller_id != user.id:
        return {'message': '只有卖家可以执行此操作'}, 403
    if o.status != 0:
        return {'message': '订单当前状态不允许发出'}, 400
    
    o.status = 1  # 变为“已发出/进行中”
    db.session.commit()
    return {'order': _order_to_dict(o, user.id)}


@order_bp.route('/<int:oid>/complete', methods=['PUT'])
def complete_order(oid):
    """买家确认收货（交易完成）"""
    from datetime import datetime
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    o = Order.query.get(oid)
    if not o:
        return {'message': '订单不存在'}, 404
    if o.buyer_id != user.id:
        return {'message': '只有买家可以确认收货'}, 403
    if o.status != 1:
        return {'message': '请等待卖家发出后再确认收货'}, 400
    
    o.status = 2
    o.complete_time = datetime.utcnow()
    if o.goods:
        o.goods.status = 2  # 商品设为已售
    
    # 自动取消该商品的其他意向订单
    Order.query.filter(
        Order.goods_id == o.goods_id,
        Order.id != o.id,
        Order.status.in_([0, 1]),
    ).update({'status': 3}, synchronize_session=False)
    
    db.session.commit()
    return {'order': _order_to_dict(o, user.id)}


def _order_to_dict(o, current_user_id):
    from app.models import Evaluation
    d = {
        'id': o.id,
        'orderNo': o.order_no,
        'buyerId': o.buyer_id,
        'sellerId': o.seller_id,
        'goodsId': o.goods_id,
        'amount': float(o.amount),
        'status': o.status,
        'createTime': o.create_time.isoformat() if o.create_time else '',
        'completeTime': o.complete_time.isoformat() if o.complete_time else '',
    }
    if o.goods:
        d['goods'] = o.goods.to_dict()
    if o.buyer:
        d['buyer'] = o.buyer.to_dict()
    if o.seller:
        d['seller'] = o.seller.to_dict()
    d['isBuyer'] = o.buyer_id == current_user_id
    to_user = o.seller_id if o.buyer_id == current_user_id else o.buyer_id
    d['toUserId'] = to_user
    if o.status == 2:
        ev = Evaluation.query.filter_by(
            order_id=o.id, from_user_id=current_user_id, to_user_id=to_user
        ).first()
        d['canEvaluate'] = ev is None
    else:
        d['canEvaluate'] = False
    return d
