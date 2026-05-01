# -*- coding: utf-8 -*-
import os
from datetime import datetime
from functools import wraps

import jwt
from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import func, or_
from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.models import Admin, Category, CreditLog, Evaluation, Goods, OperationLog, Order, Report, User

admin_bp = Blueprint('admin', __name__)


def _admin_to_dict(admin):
    return {
        'id': admin.id,
        'username': admin.username,
        'realName': admin.real_name or '',
        'role': admin.role or 'admin',
    }


def _get_request_ip():
    xff = request.headers.get('X-Forwarded-For', '')
    if xff:
        return xff.split(',')[0].strip()
    return request.remote_addr or ''


def _log_action(admin_id, action, target_type='', target_id=0, detail=''):
    try:
        log = OperationLog(
            admin_id=admin_id,
            action=action[:32],
            target_type=(target_type or '')[:16],
            target_id=int(target_id or 0),
            detail=(detail or '')[:512],
            ip=_get_request_ip()[:64],
        )
        db.session.add(log)
        db.session.commit()
    except Exception:
        db.session.rollback()


def _admin_name(admin):
    if not admin:
        return ''
    return admin.real_name or admin.username or ''


def _ensure_default_admin():
    if Admin.query.first():
        return
    username = os.getenv('ADMIN_USERNAME', 'admin')
    password = os.getenv('ADMIN_PASSWORD', 'admin123456')
    admin = Admin(
        username=username,
        password=generate_password_hash(password),
        real_name='系统管理员',
        role='super_admin',
        status=1,
    )
    db.session.add(admin)
    db.session.commit()


def get_current_admin():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth[7:]
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload.get('token_type') != 'admin':
            return None
        admin_id = int(payload.get('admin_id') or 0)
        if not admin_id:
            return None
        admin = Admin.query.get(admin_id)
        if not admin or admin.status != 1:
            return None
        return admin
    except Exception:
        return None


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        admin = get_current_admin()
        if not admin:
            return jsonify(message='管理员未登录或无权限'), 401
        return fn(admin, *args, **kwargs)
    return wrapper


def _match_password(admin, password):
    stored = admin.password or ''
    if not stored:
        return False
    if stored == password:
        return True
    try:
        return check_password_hash(stored, password)
    except ValueError:
        return False


@admin_bp.route('/login', methods=['POST'])
def login():
    _ensure_default_admin()
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    if not username or not password:
        return jsonify(message='请输入账号和密码'), 400

    admin = Admin.query.filter_by(username=username).first()
    if not admin:
        return jsonify(message='管理员账号不存在'), 404
    if admin.status != 1:
        return jsonify(message='管理员账号已停用'), 403
    if not _match_password(admin, password):
        return jsonify(message='密码错误'), 400

    admin.last_login_time = datetime.utcnow()
    db.session.commit()
    token = jwt.encode(
        {'admin_id': admin.id, 'role': admin.role, 'token_type': 'admin'},
        current_app.config['SECRET_KEY'],
        algorithm='HS256',
    )
    if isinstance(token, bytes):
        token = token.decode()
    _log_action(admin.id, 'login', 'admin', admin.id, '管理员登录')
    return {'token': token, 'admin': _admin_to_dict(admin)}


@admin_bp.route('/profile', methods=['GET'])
@admin_required
def profile(admin):
    return _admin_to_dict(admin)


@admin_bp.route('/logout', methods=['POST'])
@admin_required
def logout(admin):
    _log_action(admin.id, 'logout', 'admin', admin.id, '管理员退出登录')
    return {'ok': True}


@admin_bp.route('/dashboard/overview', methods=['GET'])
@admin_required
def dashboard_overview(admin):
    return {
        'userCount': User.query.count(),
        'goodsCount': Goods.query.count(),
        'pendingGoodsCount': Goods.query.filter_by(audit_status=0).count(),
        'reportPendingCount': Report.query.filter_by(status=0).count(),
        'orderCount': Order.query.count(),
        'completedOrderCount': Order.query.filter_by(status=2).count(),
    }


@admin_bp.route('/dashboard/trend', methods=['GET'])
@admin_required
def dashboard_trend(admin):
    days = request.args.get('days', 7, type=int)
    days = max(1, min(days, 30))
    result = []
    for offset in range(days - 1, -1, -1):
        day = datetime.utcnow().date().fromordinal(datetime.utcnow().date().toordinal() - offset)
        next_day = datetime.combine(day, datetime.min.time()).replace(hour=0, minute=0, second=0, microsecond=0)
        end_day = datetime.combine(day, datetime.max.time()).replace(hour=23, minute=59, second=59, microsecond=999999)
        result.append({
            'date': day.isoformat(),
            'users': User.query.filter(User.create_time >= next_day, User.create_time <= end_day).count(),
            'goods': Goods.query.filter(Goods.create_time >= next_day, Goods.create_time <= end_day).count(),
            'orders': Order.query.filter(Order.create_time >= next_day, Order.create_time <= end_day).count(),
            'reports': Report.query.filter(Report.create_time >= next_day, Report.create_time <= end_day).count(),
        })
    return {'list': result}


@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users(admin):
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    keyword = (request.args.get('keyword') or '').strip()
    q = User.query
    if keyword:
        q = q.filter(
            or_(
                User.nick_name.contains(keyword),
                User.phone.contains(keyword),
                User.campus.contains(keyword),
            )
        )
    pagination = q.order_by(User.create_time.desc()).paginate(page=page, per_page=page_size)
    result = []
    for user in pagination.items:
        result.append({
            'id': user.id,
            'nickName': user.nick_name or '',
            'phone': user.phone or '',
            'campus': user.campus or '',
            'creditScore': user.credit_score or 100,
            'status': user.status,
            'goodsCount': Goods.query.filter_by(user_id=user.id).count(),
            'createTime': user.create_time.isoformat() if user.create_time else '',
        })
    return {'list': result, 'total': pagination.total}


@admin_bp.route('/users/<int:uid>', methods=['GET'])
@admin_required
def get_user_detail(admin, uid):
    user = User.query.get(uid)
    if not user:
        return jsonify(message='用户不存在'), 404
    return {
        'id': user.id,
        'nickName': user.nick_name or '',
        'phone': user.phone or '',
        'campus': user.campus or '',
        'creditScore': user.credit_score or 100,
        'status': user.status,
        'goodsCount': Goods.query.filter_by(user_id=user.id).count(),
        'orderCount': Order.query.filter(or_(Order.buyer_id == user.id, Order.seller_id == user.id)).count(),
        'reportCount': Report.query.filter_by(reporter_id=user.id).count(),
        'createTime': user.create_time.isoformat() if user.create_time else '',
        'creditLogs': [
            {
                'id': row.id,
                'changeValue': row.change_value,
                'beforeScore': row.before_score,
                'afterScore': row.after_score,
                'reason': row.reason or '',
                'createTime': row.create_time.isoformat() if row.create_time else '',
            }
            for row in CreditLog.query.filter_by(user_id=user.id).order_by(CreditLog.create_time.desc()).limit(20).all()
        ],
    }


@admin_bp.route('/users/<int:uid>/status', methods=['PUT'])
@admin_required
def update_user_status(admin, uid):
    user = User.query.get(uid)
    if not user:
        return jsonify(message='用户不存在'), 404
    data = request.get_json() or {}
    status = data.get('status')
    if status not in (0, 1):
        return jsonify(message='status 参数无效'), 400
    user.status = status
    db.session.commit()
    _log_action(admin.id, 'user_status', 'user', user.id, f'设置用户状态为 {status}')
    return {'id': user.id, 'status': user.status}


@admin_bp.route('/goods', methods=['GET'])
@admin_required
def list_goods(admin):
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    keyword = (request.args.get('keyword') or '').strip()
    q = Goods.query
    if keyword:
        q = q.filter(Goods.title.contains(keyword))
    pagination = q.order_by(Goods.create_time.desc()).paginate(page=page, per_page=page_size)
    result = []
    for goods in pagination.items:
        seller = User.query.get(goods.user_id)
        category = Category.query.get(goods.category_id) if goods.category_id else None
        result.append({
            'id': goods.id,
            'title': goods.title,
            'price': float(goods.price),
            'category': category.name if category else '',
            'sellerName': seller.nick_name if seller else '',
            'status': goods.status,
            'auditStatus': goods.audit_status,
            'viewCount': goods.view_count or 0,
            'createTime': goods.create_time.isoformat() if goods.create_time else '',
        })
    return {'list': result, 'total': pagination.total}


@admin_bp.route('/goods/<int:gid>', methods=['GET'])
@admin_required
def get_goods_detail(admin, gid):
    goods = Goods.query.get(gid)
    if not goods:
        return jsonify(message='商品不存在'), 404
    seller = User.query.get(goods.user_id)
    category = Category.query.get(goods.category_id) if goods.category_id else None
    return {
        'id': goods.id,
        'title': goods.title,
        'description': goods.description or '',
        'price': float(goods.price),
        'images': goods.images or [],
        'category': category.name if category else '',
        'categoryId': goods.category_id,
        'seller': {
            'id': seller.id,
            'nickName': seller.nick_name or '',
            'phone': seller.phone or '',
            'campus': seller.campus or '',
        } if seller else None,
        'status': goods.status,
        'auditStatus': goods.audit_status,
        'viewCount': goods.view_count or 0,
        'address': goods.address or '',
        'lat': float(goods.lat),
        'lng': float(goods.lng),
        'createTime': goods.create_time.isoformat() if goods.create_time else '',
        'updateTime': goods.update_time.isoformat() if goods.update_time else '',
    }


@admin_bp.route('/goods/<int:gid>/audit', methods=['PUT'])
@admin_required
def audit_goods(admin, gid):
    goods = Goods.query.get(gid)
    if not goods:
        return jsonify(message='商品不存在'), 404
    data = request.get_json() or {}
    audit_status = data.get('auditStatus')
    if audit_status not in (0, 1, 2):
        return jsonify(message='auditStatus 参数无效'), 400
    goods.audit_status = audit_status
    db.session.commit()
    _log_action(admin.id, 'goods_audit', 'goods', goods.id, f'设置审核状态为 {audit_status}')
    return {'id': goods.id, 'auditStatus': goods.audit_status}


@admin_bp.route('/goods/<int:gid>/status', methods=['PUT'])
@admin_required
def update_goods_status(admin, gid):
    goods = Goods.query.get(gid)
    if not goods:
        return jsonify(message='商品不存在'), 404
    data = request.get_json() or {}
    status = data.get('status')
    if status not in (0, 1, 2):
        return jsonify(message='status 参数无效'), 400
    goods.status = status
    db.session.commit()
    _log_action(admin.id, 'goods_status', 'goods', goods.id, f'设置商品状态为 {status}')
    return {'id': goods.id, 'status': goods.status}


@admin_bp.route('/reports', methods=['GET'])
@admin_required
def list_reports(admin):
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    pagination = Report.query.order_by(Report.create_time.desc()).paginate(page=page, per_page=page_size)
    result = []
    for report in pagination.items:
        reporter = User.query.get(report.reporter_id)
        result.append({
            'id': report.id,
            'reporterName': reporter.nick_name if reporter else '',
            'targetType': report.target_type,
            'targetId': report.target_id,
            'reason': report.reason or '',
            'content': report.content or '',
            'status': report.status,
            'handleRemark': report.handle_remark or '',
            'createTime': report.create_time.isoformat() if report.create_time else '',
        })
    return {'list': result, 'total': pagination.total}


@admin_bp.route('/reports/<int:rid>', methods=['GET'])
@admin_required
def get_report_detail(admin, rid):
    report = Report.query.get(rid)
    if not report:
        return jsonify(message='举报记录不存在'), 404
    reporter = User.query.get(report.reporter_id)
    handler = Admin.query.get(report.handler_id) if report.handler_id else None
    return {
        'id': report.id,
        'reporterName': reporter.nick_name if reporter else '',
        'reporterId': report.reporter_id,
        'targetType': report.target_type,
        'targetId': report.target_id,
        'reason': report.reason or '',
        'content': report.content or '',
        'status': report.status,
        'handleRemark': report.handle_remark or '',
        'handlerName': _admin_name(handler),
        'createTime': report.create_time.isoformat() if report.create_time else '',
        'handleTime': report.handle_time.isoformat() if report.handle_time else '',
    }


@admin_bp.route('/reports/<int:rid>/handle', methods=['PUT'])
@admin_required
def handle_report(admin, rid):
    report = Report.query.get(rid)
    if not report:
        return jsonify(message='举报记录不存在'), 404
    data = request.get_json() or {}
    status = data.get('status')
    handle_remark = (data.get('handleRemark') or '').strip()
    if status not in (1, 2):
        return jsonify(message='status 参数无效'), 400
    report.status = status
    report.handler_id = admin.id
    report.handle_remark = handle_remark[:256]
    report.handle_time = datetime.utcnow()
    db.session.commit()
    _log_action(admin.id, 'report_handle', 'report', report.id, f'处理举报状态为 {status}')
    return {'id': report.id, 'status': report.status, 'handleRemark': report.handle_remark}


@admin_bp.route('/categories', methods=['GET'])
@admin_required
def list_categories(admin):
    rows = Category.query.order_by(Category.sort_order.asc(), Category.id.asc()).all()
    return {
        'list': [
            {
                'id': row.id,
                'name': row.name,
                'parentId': row.parent_id,
                'sortOrder': row.sort_order,
                'status': row.status,
                'createTime': row.create_time.isoformat() if row.create_time else '',
            }
            for row in rows
        ],
        'total': len(rows),
    }


@admin_bp.route('/categories', methods=['POST'])
@admin_required
def create_category(admin):
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify(message='分类名称不能为空'), 400
    if Category.query.filter_by(name=name).first():
        return jsonify(message='分类名称已存在'), 400
    row = Category(
        name=name[:32],
        parent_id=int(data.get('parentId') or 0),
        sort_order=int(data.get('sortOrder') or 0),
        status=int(data.get('status') if data.get('status') in (0, 1) else 1),
    )
    db.session.add(row)
    db.session.commit()
    _log_action(admin.id, 'category_create', 'category', row.id, f'新增分类 {row.name}')
    return {
        'id': row.id,
        'name': row.name,
        'parentId': row.parent_id,
        'sortOrder': row.sort_order,
        'status': row.status,
        'createTime': row.create_time.isoformat() if row.create_time else '',
    }


@admin_bp.route('/categories/<int:cid>', methods=['PUT'])
@admin_required
def update_category(admin, cid):
    row = Category.query.get(cid)
    if not row:
        return jsonify(message='分类不存在'), 404
    data = request.get_json() or {}
    if 'name' in data:
        name = (data.get('name') or '').strip()
        if not name:
            return jsonify(message='分类名称不能为空'), 400
        dup = Category.query.filter(Category.name == name, Category.id != cid).first()
        if dup:
            return jsonify(message='分类名称已存在'), 400
        row.name = name[:32]
    if 'parentId' in data:
        row.parent_id = int(data.get('parentId') or 0)
    if 'sortOrder' in data:
        row.sort_order = int(data.get('sortOrder') or 0)
    if 'status' in data:
        status = data.get('status')
        if status not in (0, 1):
            return jsonify(message='status 参数无效'), 400
        row.status = status
    db.session.commit()
    _log_action(admin.id, 'category_update', 'category', row.id, f'更新分类 {row.name}')
    return {
        'id': row.id,
        'name': row.name,
        'parentId': row.parent_id,
        'sortOrder': row.sort_order,
        'status': row.status,
        'createTime': row.create_time.isoformat() if row.create_time else '',
    }


@admin_bp.route('/orders', methods=['GET'])
@admin_required
def list_orders(admin):
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    pagination = Order.query.order_by(Order.create_time.desc()).paginate(page=page, per_page=page_size)
    result = []
    for order in pagination.items:
        buyer = User.query.get(order.buyer_id)
        seller = User.query.get(order.seller_id)
        goods = Goods.query.get(order.goods_id)
        result.append({
            'id': order.id,
            'orderNo': order.order_no,
            'buyerName': buyer.nick_name if buyer else '',
            'sellerName': seller.nick_name if seller else '',
            'goodsTitle': goods.title if goods else '',
            'amount': float(order.amount),
            'status': order.status,
            'createTime': order.create_time.isoformat() if order.create_time else '',
            'completeTime': order.complete_time.isoformat() if order.complete_time else '',
        })
    return {'list': result, 'total': pagination.total}


@admin_bp.route('/orders/<int:oid>', methods=['GET'])
@admin_required
def get_order_detail(admin, oid):
    order = Order.query.get(oid)
    if not order:
        return jsonify(message='订单不存在'), 404
    buyer = User.query.get(order.buyer_id)
    seller = User.query.get(order.seller_id)
    goods = Goods.query.get(order.goods_id)
    return {
        'id': order.id,
        'orderNo': order.order_no,
        'buyer': {
            'id': buyer.id,
            'nickName': buyer.nick_name or '',
            'phone': buyer.phone or '',
        } if buyer else None,
        'seller': {
            'id': seller.id,
            'nickName': seller.nick_name or '',
            'phone': seller.phone or '',
        } if seller else None,
        'goods': {
            'id': goods.id,
            'title': goods.title,
            'price': float(goods.price),
        } if goods else None,
        'amount': float(order.amount),
        'status': order.status,
        'payType': order.pay_type or '',
        'remark': order.remark or '',
        'createTime': order.create_time.isoformat() if order.create_time else '',
        'completeTime': order.complete_time.isoformat() if order.complete_time else '',
    }


@admin_bp.route('/evaluations', methods=['GET'])
@admin_required
def list_evaluations(admin):
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    keyword = (request.args.get('keyword') or '').strip()
    q = Evaluation.query
    if keyword:
        q = q.filter(Evaluation.comment.contains(keyword))
    pagination = q.order_by(Evaluation.create_time.desc()).paginate(page=page, per_page=page_size)
    result = []
    for row in pagination.items:
        from_user = User.query.get(row.from_user_id)
        to_user = User.query.get(row.to_user_id)
        result.append({
            'id': row.id,
            'orderId': row.order_id,
            'fromUserName': from_user.nick_name if from_user else '',
            'toUserName': to_user.nick_name if to_user else '',
            'role': row.role,
            'star': row.star,
            'comment': row.comment or '',
            'createTime': row.create_time.isoformat() if row.create_time else '',
        })
    return {'list': result, 'total': pagination.total}


@admin_bp.route('/evaluations/<int:eid>', methods=['DELETE'])
@admin_required
def delete_evaluation(admin, eid):
    row = Evaluation.query.get(eid)
    if not row:
        return jsonify(message='评价不存在'), 404
    db.session.delete(row)
    db.session.commit()
    _log_action(admin.id, 'evaluation_delete', 'evaluation', eid, '删除评价')
    return {'ok': True}


@admin_bp.route('/accounts', methods=['GET'])
@admin_required
def list_accounts(admin):
    rows = Admin.query.order_by(Admin.id.asc()).all()
    return {
        'list': [
            {
                'id': row.id,
                'username': row.username,
                'realName': row.real_name or '',
                'role': row.role or 'admin',
                'status': row.status,
                'lastLoginTime': row.last_login_time.isoformat() if row.last_login_time else '',
                'createTime': row.create_time.isoformat() if row.create_time else '',
            }
            for row in rows
        ],
        'total': len(rows),
    }


@admin_bp.route('/accounts', methods=['POST'])
@admin_required
def create_account(admin):
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    if not username or not password:
        return jsonify(message='账号和密码不能为空'), 400
    if Admin.query.filter_by(username=username).first():
        return jsonify(message='账号已存在'), 400
    row = Admin(
        username=username[:32],
        password=generate_password_hash(password),
        real_name=(data.get('realName') or '')[:32],
        role=(data.get('role') or 'admin')[:16],
        status=int(data.get('status') if data.get('status') in (0, 1) else 1),
    )
    db.session.add(row)
    db.session.commit()
    _log_action(admin.id, 'account_create', 'admin', row.id, f'新增管理员 {row.username}')
    return _admin_to_dict(row)


@admin_bp.route('/accounts/<int:aid>', methods=['PUT'])
@admin_required
def update_account(admin, aid):
    row = Admin.query.get(aid)
    if not row:
        return jsonify(message='管理员不存在'), 404
    data = request.get_json() or {}
    if 'realName' in data:
        row.real_name = (data.get('realName') or '')[:32]
    if 'role' in data:
        row.role = (data.get('role') or 'admin')[:16]
    if 'status' in data:
        status = data.get('status')
        if status not in (0, 1):
            return jsonify(message='status 参数无效'), 400
        row.status = status
    if data.get('password'):
        row.password = generate_password_hash(data.get('password'))
    db.session.commit()
    _log_action(admin.id, 'account_update', 'admin', row.id, f'更新管理员 {row.username}')
    return {
        'id': row.id,
        'username': row.username,
        'realName': row.real_name or '',
        'role': row.role or 'admin',
        'status': row.status,
    }


@admin_bp.route('/logs', methods=['GET'])
@admin_required
def list_logs(admin):
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    pagination = OperationLog.query.order_by(OperationLog.create_time.desc()).paginate(page=page, per_page=page_size)
    result = []
    for row in pagination.items:
        actor = Admin.query.get(row.admin_id)
        result.append({
            'id': row.id,
            'adminName': _admin_name(actor),
            'action': row.action,
            'targetType': row.target_type or '',
            'targetId': row.target_id or 0,
            'detail': row.detail or '',
            'ip': row.ip or '',
            'createTime': row.create_time.isoformat() if row.create_time else '',
        })
    return {'list': result, 'total': pagination.total}
