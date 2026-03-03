# -*- coding: utf-8 -*-
from flask import Blueprint, request
from app import db
from app.models import Evaluation, Order, User, CreditLog
from .user import get_current_user

evaluation_bp = Blueprint('evaluation', __name__)


@evaluation_bp.route('', methods=['POST'])
def create_evaluation():
    """提交评价"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    data = request.get_json() or {}
    order_id = data.get('orderId') or data.get('order_id')
    to_user_id = data.get('toUserId') or data.get('to_user_id')
    star = data.get('star', 0)
    comment = (data.get('comment') or '').strip()
    if not order_id or not to_user_id:
        return {'message': '缺少 orderId 或 toUserId'}, 400
    if star < 1 or star > 5:
        return {'message': '请选择1-5星'}, 400
    o = Order.query.get(order_id)
    if not o:
        return {'message': '订单不存在'}, 404
    if o.status != 2:
        return {'message': '只有已完成的订单才能评价'}, 400
    if o.buyer_id == user.id:
        role = 'buyer'
        target = o.seller_id
    elif o.seller_id == user.id:
        role = 'seller'
        target = o.buyer_id
    else:
        return {'message': '无权限'}, 403
    if int(to_user_id) != target:
        return {'message': '参数错误'}, 400
    existing = Evaluation.query.filter_by(
        order_id=order_id, from_user_id=user.id, to_user_id=target
    ).first()
    if existing:
        return {'message': '已评价过'}, 400
    ev = Evaluation(
        order_id=order_id,
        from_user_id=user.id,
        to_user_id=target,
        role=role,
        star=star,
        comment=comment,
    )
    db.session.add(ev)
    to_user = User.query.get(target)
    if to_user:
        before = to_user.credit_score or 100
        delta = star - 3
        after = max(0, min(100, before + delta))
        to_user.credit_score = after
        cl = CreditLog(
            user_id=target,
            change_value=delta,
            before_score=before,
            after_score=after,
            reason='评价',
            ref_id=ev.id,
        )
        db.session.add(cl)
    db.session.commit()
    return {'id': ev.id}


@evaluation_bp.route('/user/<int:uid>', methods=['GET'])
def list_by_user(uid):
    """某用户的评价列表"""
    page = request.args.get('page', 1, type=int)
    per = request.args.get('pageSize', 20, type=int)
    evs = (
        Evaluation.query.filter_by(to_user_id=uid)
        .order_by(Evaluation.create_time.desc())
        .paginate(page=page, per_page=per)
    )
    result = []
    for e in evs.items:
        from_user = User.query.get(e.from_user_id)
        result.append({
            'id': e.id,
            'orderId': e.order_id,
            'fromUser': from_user.to_dict() if from_user else None,
            'role': e.role,
            'star': e.star,
            'comment': e.comment,
            'createTime': e.create_time.isoformat() if e.create_time else '',
        })
    return {'list': result, 'total': evs.total}
