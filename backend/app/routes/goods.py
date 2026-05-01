import math
from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from app import db
from app.models import Goods, User, Category, GoodsComment, Favorite, BrowseHistory, Order
from .user import get_current_user

goods_bp = Blueprint('goods', __name__)

AREA_KEYWORDS = {
    '宿舍区': ['宿舍区', '宿舍', '宿舍楼', '寝室', '公寓', '楼栋', '学生公寓', '研究生公寓', '1栋', '2栋', '3栋', '4栋', '5栋'],
    '教学区': ['教学区', '教学楼', '教学', '教室', '实验楼', '实验室', '学院楼', '创客空间', 'A座', 'B座'],
    '图书馆': ['图书馆', '阅览室', '自习室', '书库'],
    '食堂周边': ['食堂周边', '食堂', '餐厅', '饭堂'],
    '运动场': ['运动场', '操场', '体育场', '体育馆', '篮球场', '足球场', '看台'],
    '快递点': ['快递点', '快递', '驿站', '菜鸟', '取件点'],
}


def area_keywords(area):
    area = (area or '').strip()
    if not area or area == '全部':
        return []
    words = AREA_KEYWORDS.get(area, [area])
    result = []
    for word in [area, *words]:
        if word and word not in result:
            result.append(word)
    return result


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
    try:
        return _list_goods_impl()
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify(message=f'服务器错误: {str(e)}'), 500


def _list_goods_impl():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', type=float)
    category = request.args.get('category')
    keyword = request.args.get('keyword')
    campus = request.args.get('campus')  # 校内区域/楼栋筛选 LR-005
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
    area_words = area_keywords(campus)
    if area_words:
        filters = []
        for word in area_words:
            filters.append(User.campus.contains(word))
            filters.append(Goods.address.contains(word))
        q = q.join(User, Goods.user_id == User.id).filter(or_(*filters))
    q = q.order_by(Goods.create_time.desc())
    pagination = q.paginate(page=page, per_page=page_size)

    items = pagination.items
    if lat is not None and lng is not None:
        items_with_dist = []
        for g in items:
            if g.lat is None or g.lng is None:
                continue
            try:
                d = haversine_distance(lat, lng, g.lat, g.lng)
                items_with_dist.append((g, d))
            except (TypeError, ValueError):
                continue
        if radius:
            items_with_dist = [(g, d) for g, d in items_with_dist if d <= radius]
        items_with_dist.sort(key=lambda x: x[1])
        list_data = [g.to_dict(distance=d) for g, d in items_with_dist]
    else:
        list_data = [g.to_dict() for g in items]

    return {'list': list_data, 'total': pagination.total}


@goods_bp.route('/<int:gid>/comments', methods=['GET'])
def list_comments(gid):
    """商品评论列表"""
    g = Goods.query.get(gid)
    if not g:
        return {'message': '商品不存在'}, 404
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    q = GoodsComment.query.filter_by(goods_id=gid).order_by(GoodsComment.create_time.desc())
    pagination = q.paginate(page=page, per_page=page_size)
    result = []
    for c in pagination.items:
        item = {
            'id': c.id,
            'goodsId': c.goods_id,
            'userId': c.user_id,
            'content': c.content,
            'createTime': c.create_time.isoformat() if c.create_time else '',
        }
        if c.user:
            item['user'] = c.user.to_dict()
        result.append(item)
    return {'list': result, 'total': pagination.total}


@goods_bp.route('/<int:gid>/comments', methods=['POST'])
def create_comment(gid):
    """发表商品评论"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    g = Goods.query.get(gid)
    if not g:
        return {'message': '商品不存在'}, 404
    if g.status != 1:
        return {'message': '商品已下架或已售'}, 400
    data = request.get_json() or {}
    content = (data.get('content') or '').strip()
    if not content:
        return {'message': '评论内容不能为空'}, 400
    if len(content) > 500:
        return {'message': '评论最多500字'}, 400
    c = GoodsComment(goods_id=gid, user_id=user.id, content=content)
    db.session.add(c)
    db.session.commit()
    return {
        'id': c.id,
        'goodsId': c.goods_id,
        'userId': c.user_id,
        'content': c.content,
        'createTime': c.create_time.isoformat() if c.create_time else '',
        'user': user.to_dict(),
    }


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
    if Order.query.filter_by(goods_id=gid).first():
        return {'message': '该商品已有订单，无法删除'}, 400
    # 先删除关联数据，避免 goods_id 被置为 NULL 触发 IntegrityError
    GoodsComment.query.filter_by(goods_id=gid).delete()
    Favorite.query.filter_by(goods_id=gid).delete()
    BrowseHistory.query.filter_by(goods_id=gid).delete()
    db.session.delete(g)
    db.session.commit()
    return {}
