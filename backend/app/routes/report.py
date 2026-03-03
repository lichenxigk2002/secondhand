# -*- coding: utf-8 -*-
from flask import Blueprint, request
from app import db
from app.models import Report
from .user import get_current_user

report_bp = Blueprint('report', __name__)

REASONS = ['虚假信息', '违规内容', '欺诈行为', '侵权', '其他']


@report_bp.route('', methods=['POST'])
def create_report():
    """提交举报"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    data = request.get_json() or {}
    target_type = data.get('targetType') or data.get('target_type')
    target_id = data.get('targetId') or data.get('target_id')
    reason = data.get('reason') or '其他'
    content = (data.get('content') or '').strip()
    if not target_type or not target_id:
        return {'message': '缺少 targetType 或 targetId'}, 400
    if target_type not in ('goods', 'user', 'message'):
        return {'message': 'targetType 无效'}, 400
    r = Report(
        reporter_id=user.id,
        target_type=target_type,
        target_id=int(target_id),
        reason=reason[:32],
        content=content[:512],
    )
    db.session.add(r)
    db.session.commit()
    return {'id': r.id, 'message': '举报已提交'}
