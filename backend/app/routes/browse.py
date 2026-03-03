# -*- coding: utf-8 -*-
from flask import Blueprint, request
from app import db
from app.models import BrowseHistory, Goods
from .user import get_current_user

browse_bp = Blueprint('browse', __name__)


@browse_bp.route('/record', methods=['POST'])
def record():
    """记录浏览"""
    user = get_current_user()
    if not user:
        return {}
    data = request.get_json() or {}
    goods_id = data.get('goodsId') or data.get('goods_id')
    if not goods_id:
        return {}
    g = Goods.query.get(goods_id)
    if not g:
        return {}
    g.view_count = (g.view_count or 0) + 1
    bh = BrowseHistory(user_id=user.id, goods_id=goods_id)
    db.session.add(bh)
    db.session.commit()
    return {}


@browse_bp.route('', methods=['GET'])
def list_history():
    """浏览历史（按最近浏览，去重）"""
    user = get_current_user()
    if not user:
        return {'list': []}
    per = request.args.get('pageSize', 50, type=int)
    history = (
        BrowseHistory.query.filter_by(user_id=user.id)
        .order_by(BrowseHistory.create_time.desc())
        .limit(per * 2)
        .all()
    )
    seen = set()
    result = []
    for h in history:
        if h.goods_id in seen:
            continue
        seen.add(h.goods_id)
        g = Goods.query.get(h.goods_id)
        if g and g.status == 1:
            result.append(g.to_dict())
        if len(result) >= per:
            break
    return {'list': result}
