# -*- coding: utf-8 -*-
from datetime import datetime
from flask import Blueprint, request
from app import db
from app.models import Conversation, Message, User
from .user import get_current_user

message_bp = Blueprint('message', __name__)


def _conv_to_dict(c, current_user_id):
    """会话转字典，other 为对方用户"""
    u1, u2 = c.user1_id, c.user2_id
    other_id = u2 if current_user_id == u1 else u1
    unread = c.user1_unread if current_user_id == u1 else c.user2_unread
    other = User.query.get(other_id)
    last_msg = Message.query.get(c.last_message_id) if c.last_message_id else None
    return {
        'id': c.id,
        'otherUser': other.to_dict() if other else None,
        'goodsId': c.goods_id,
        'lastMessage': last_msg.content[:50] if last_msg else '',
        'lastMessageAt': c.last_message_at.isoformat() if c.last_message_at else '',
        'unread': unread,
    }


@message_bp.route('/unread-count', methods=['GET'])
def unread_count():
    """当前用户未读消息总数（用于角标）AR-003"""
    user = get_current_user()
    if not user:
        return {'count': 0}
    convs = Conversation.query.filter(
        (Conversation.user1_id == user.id) | (Conversation.user2_id == user.id)
    ).all()
    total = 0
    for c in convs:
        total += c.user1_unread if user.id == c.user1_id else c.user2_unread
    return {'count': total}


@message_bp.route('/conversations', methods=['GET'])
def list_conversations():
    """会话列表"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    convs = (
        Conversation.query.filter(
            (Conversation.user1_id == user.id) | (Conversation.user2_id == user.id)
        )
        .order_by(Conversation.update_time.desc())
        .limit(50)
        .all()
    )
    return {'list': [_conv_to_dict(c, user.id) for c in convs]}


@message_bp.route('/conversation', methods=['POST'])
def get_or_create_conversation():
    """获取或创建会话 targetId, goodsId(可选)"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    data = request.get_json() or {}
    target_id = data.get('targetId') or data.get('target_id')
    goods_id = data.get('goodsId') or data.get('goods_id') or 0
    if not target_id:
        return {'message': '缺少 targetId'}, 400
    target_id = int(target_id)
    if target_id == user.id:
        return {'message': '不能和自己聊天'}, 400

    u1, u2 = min(user.id, target_id), max(user.id, target_id)
    conv = Conversation.query.filter_by(user1_id=u1, user2_id=u2).first()
    if not conv:
        conv = Conversation(user1_id=u1, user2_id=u2, goods_id=goods_id)
        db.session.add(conv)
        db.session.commit()
    return {'conversation': _conv_to_dict(conv, user.id)}


@message_bp.route('/conversations/<int:cid>/messages', methods=['GET'])
def list_messages(cid):
    """消息列表"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    conv = Conversation.query.get(cid)
    if not conv or (user.id != conv.user1_id and user.id != conv.user2_id):
        return {'message': '会话不存在'}, 404

    # 标记已读
    if user.id == conv.user1_id:
        conv.user1_unread = 0
    else:
        conv.user2_unread = 0
    db.session.commit()

    page = request.args.get('page', 1, type=int)
    per = request.args.get('pageSize', 50, type=int)
    msgs = (
        Message.query.filter_by(conversation_id=cid)
        .order_by(Message.create_time.desc())
        .paginate(page=page, per_page=per)
    )
    items = [
        {
            'id': m.id,
            'fromUserId': m.from_user_id,
            'toUserId': m.to_user_id,
            'content': m.content,
            'msgType': m.msg_type,
            'isFromMe': m.from_user_id == user.id,
            'createTime': m.create_time.isoformat() if m.create_time else '',
        }
        for m in reversed(msgs.items)
    ]
    return {'list': items, 'total': msgs.total}


@message_bp.route('/conversations/<int:cid>/messages', methods=['POST'])
def send_message(cid):
    """发送消息"""
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    conv = Conversation.query.get(cid)
    if not conv or (user.id != conv.user1_id and user.id != conv.user2_id):
        return {'message': '会话不存在'}, 404

    data = request.get_json() or {}
    content = (data.get('content') or '').strip()
    if not content:
        return {'message': '消息不能为空'}, 400

    to_user_id = conv.user2_id if user.id == conv.user1_id else conv.user1_id
    msg = Message(
        conversation_id=cid,
        from_user_id=user.id,
        to_user_id=to_user_id,
        content=content,
    )
    db.session.add(msg)
    db.session.flush()

    conv.last_message_id = msg.id
    conv.last_message_at = datetime.utcnow()
    if user.id == conv.user1_id:
        conv.user2_unread += 1
    else:
        conv.user1_unread += 1
    db.session.commit()

    return {
        'id': msg.id,
        'fromUserId': msg.from_user_id,
        'toUserId': msg.to_user_id,
        'content': msg.content,
        'msgType': msg.msg_type,
        'isFromMe': True,
        'createTime': msg.create_time.isoformat() if msg.create_time else '',
    }
