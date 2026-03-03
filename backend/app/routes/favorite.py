from flask import Blueprint, request
from app import db
from app.models import Favorite, Goods
from .user import get_current_user

favorite_bp = Blueprint('favorite', __name__)


@favorite_bp.route('', methods=['GET'])
def list_favorites():
    """收藏列表"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    favs = Favorite.query.filter_by(user_id=user.id).order_by(Favorite.create_time.desc())
    pagination = favs.paginate(page=page, per_page=page_size)
    goods_ids = [f.goods_id for f in pagination.items]
    goods_map = {g.id: g for g in Goods.query.filter(Goods.id.in_(goods_ids)).all()}
    list_data = [goods_map[f.goods_id].to_dict() for f in pagination.items if f.goods_id in goods_map]
    return {'list': list_data, 'total': pagination.total}


@favorite_bp.route('/check/<int:gid>', methods=['GET'])
def check(gid):
    """是否已收藏"""
    user = get_current_user()
    if not user:
        return {'favorited': False}
    fav = Favorite.query.filter_by(user_id=user.id, goods_id=gid).first()
    return {'favorited': fav is not None}


@favorite_bp.route('/toggle/<int:gid>', methods=['POST'])
def toggle(gid):
    """收藏/取消收藏"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    g = Goods.query.get(gid)
    if not g:
        return {'message': '商品不存在'}, 404
    fav = Favorite.query.filter_by(user_id=user.id, goods_id=gid).first()
    if fav:
        db.session.delete(fav)
        db.session.commit()
        return {'favorited': False}
    fav = Favorite(user_id=user.id, goods_id=gid)
    db.session.add(fav)
    db.session.commit()
    return {'favorited': True}
