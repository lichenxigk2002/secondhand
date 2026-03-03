import math
from flask import Blueprint, request
from app import db
from app.models import Goods, User, Category
from .user import get_current_user

goods_bp = Blueprint('goods', __name__)


def haversine_distance(lat1, lng1, lat2, lng2):
    """Haversine 公式计算两点距离(km)"""
    R = 6371
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


@goods_bp.route('/mine', methods=['GET'])
def my_goods():
    """我的发布"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    status = request.args.get('status', type=int)  # 可选：0下架 1上架 2已售，不传则全部
    q = Goods.query.filter_by(user_id=user.id).order_by(Goods.create_time.desc())
    if status is not None:
        q = q.filter_by(status=status)
    pagination = q.paginate(page=page, per_page=page_size)
    list_data = [g.to_dict() for g in pagination.items]
    return {'list': list_data, 'total': pagination.total}


@goods_bp.route('/<int:gid>/status', methods=['PUT'])
def toggle_goods_status(gid):
    """上下架"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    g = Goods.query.get(gid)
    if not g:
        return {'message': '商品不存在'}, 404
    if g.user_id != user.id:
        return {'message': '无权限'}, 403
    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status is not None and new_status in (0, 1, 2):
        g.status = new_status
        db.session.commit()
    return g.to_dict()


@goods_bp.route('/nearby', methods=['GET'])
def nearby():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', 5, type=float)
    if lat is None or lng is None:
        return {'message': '缺少 lat/lng'}, 400

    items = Goods.query.filter_by(status=1, audit_status=1).all()
    result = []
    for g in items:
        dist = haversine_distance(lat, lng, g.lat, g.lng)
        if dist <= radius:
            result.append((g, dist))
    result.sort(key=lambda x: x[1])
    list_data = [g.to_dict(distance=d) for g, d in result[:50]]
    return {'list': list_data}


@goods_bp.route('', methods=['GET'])
def list_goods():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', type=float)
    category = request.args.get('category')
    keyword = request.args.get('keyword')
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)

    q = Goods.query.filter_by(status=1, audit_status=1)
    if category:
        if isinstance(category, int):
            q = q.filter(Goods.category_id == category)
        else:
            c = Category.query.filter_by(name=category, status=1).first()
            if c:
                q = q.filter(Goods.category_id == c.id)
    if keyword:
        q = q.filter(Goods.title.contains(keyword))
    q = q.order_by(Goods.create_time.desc())
    pagination = q.paginate(page=page, per_page=page_size)

    items = pagination.items
    if lat is not None and lng is not None:
        items_with_dist = [(g, haversine_distance(lat, lng, g.lat, g.lng)) for g in items]
        if radius:
            items_with_dist = [(g, d) for g, d in items_with_dist if d <= radius]
        items_with_dist.sort(key=lambda x: x[1])
        list_data = [g.to_dict(distance=d) for g, d in items_with_dist]
    else:
        list_data = [g.to_dict() for g in items]

    return {'list': list_data, 'total': pagination.total}


@goods_bp.route('/<int:gid>', methods=['GET'])
def get_goods(gid):
    g = Goods.query.get(gid)
    if not g:
        return {'message': '商品不存在'}, 404
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    dist = None
    if lat is not None and lng is not None:
        dist = haversine_distance(lat, lng, g.lat, g.lng)
    return g.to_dict(distance=dist)


@goods_bp.route('', methods=['POST'])
def create_goods():
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    data = request.get_json()
    if not data:
        return {'message': '参数错误'}, 400
    title = data.get('title')
    price = data.get('price')
    category_id = data.get('categoryId', 0)
    category_name = data.get('category', '')
    if category_id == 0 and category_name:
        c = Category.query.filter_by(name=category_name).first()
        if c:
            category_id = c.id
    images = data.get('images', [])
    description = data.get('description') or data.get('desc') or ''
    lat = data.get('lat')
    lng = data.get('lng')
    if not title:
        return {'message': '标题不能为空'}, 400
    if price is None:
        return {'message': '价格不能为空'}, 400
    if lat is None or lng is None:
        return {'message': '请选择位置'}, 400
    g = Goods(
        user_id=user.id,
        title=title,
        price=price,
        description=description,
        images=images,
        category_id=category_id,
        lat=lat,
        lng=lng,
        audit_status=1,  # 发布即通过，便于展示
    )
    db.session.add(g)
    db.session.commit()
    return g.to_dict()


@goods_bp.route('/<int:gid>', methods=['PUT'])
def update_goods(gid):
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    g = Goods.query.get(gid)
    if not g:
        return {'message': '商品不存在'}, 404
    if g.user_id != user.id:
        return {'message': '无权限'}, 403
    data = request.get_json() or {}
    mapping = {
        'title': 'title', 'price': 'price', 'images': 'images', 'status': 'status',
        'lat': 'lat', 'lng': 'lng', 'description': 'description',
        'categoryId': 'category_id', 'category_id': 'category_id',
    }
    for k, attr in mapping.items():
        if k in data:
            setattr(g, attr, data[k])
    if 'category' in data and 'categoryId' not in data:
        c = Category.query.filter_by(name=data['category'], status=1).first()
        if c:
            g.category_id = c.id
    db.session.commit()
    return g.to_dict()


@goods_bp.route('/<int:gid>', methods=['DELETE'])
def delete_goods(gid):
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    g = Goods.query.get(gid)
    if not g:
        return {'message': '商品不存在'}, 404
    if g.user_id != user.id:
        return {'message': '无权限'}, 403
    db.session.delete(g)
    db.session.commit()
    return {}
