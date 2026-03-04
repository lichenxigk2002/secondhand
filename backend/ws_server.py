import asyncio
import json
from typing import Dict, Set
from urllib.parse import urlparse, parse_qs

import jwt
import websockets
from websockets.server import WebSocketServerProtocol

from app import create_app, db
from app.models import Conversation, Message, User
from config import Config


app = create_app()

# user_id -> set of websockets
connections: Dict[int, Set[WebSocketServerProtocol]] = {}


async def handle_connection(ws: WebSocketServerProtocol):
    """
    简单 WebSocket 聊天服务：
    - 通过 query 中的 token 鉴权
    - 只处理 type=send 的消息：{"type":"send","conversationId":123,"content":"..."}
    - 新消息写入数据库，并向会话双方在线连接推送 type=message
    """
    parsed = urlparse(ws.path)
    qs = parse_qs(parsed.query or "")
    token = (qs.get("token") or [""])[0]

    user_id = None
    try:
        if not token:
            await ws.close(code=4001, reason="missing token")
            return
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = int(payload.get("user_id") or 0)
        if not user_id:
            await ws.close(code=4002, reason="invalid token")
            return
    except Exception:
        await ws.close(code=4003, reason="auth failed")
        return

    # 注册连接
    conns = connections.setdefault(user_id, set())
    conns.add(ws)
    try:
        async for raw in ws:
            try:
                data = json.loads(raw)
            except Exception:
                continue
            if not isinstance(data, dict):
                continue
            msg_type = data.get("type")
            if msg_type != "send":
                continue
            cid = int(data.get("conversationId") or 0)
            content = (data.get("content") or "").strip()
            if not cid or not content:
                continue
            # 写数据库并广播
            await handle_send_message(user_id, cid, content)
    finally:
        # 连接关闭时清理
        if user_id is not None:
            conns = connections.get(user_id)
            if conns is not None:
                conns.discard(ws)
                if not conns:
                    connections.pop(user_id, None)


async def handle_send_message(from_user_id: int, conversation_id: int, content: str):
    """
    封装一条发送消息逻辑，尽量与 HTTP 接口 /api/message/conversations/<cid>/messages 对齐。
    """
    def _sync():
        from datetime import datetime

        with app.app_context():
            conv = Conversation.query.get(conversation_id)
            if not conv or (from_user_id != conv.user1_id and from_user_id != conv.user2_id):
                return None, None
            to_user_id = conv.user2_id if from_user_id == conv.user1_id else conv.user1_id
            msg = Message(
                conversation_id=conversation_id,
                from_user_id=from_user_id,
                to_user_id=to_user_id,
                content=content,
            )
            db.session.add(msg)
            db.session.flush()

            conv.last_message_id = msg.id
            conv.last_message_at = datetime.utcnow()
            if from_user_id == conv.user1_id:
                conv.user2_unread += 1
            else:
                conv.user1_unread += 1
            db.session.commit()

            body = {
                "id": msg.id,
                "fromUserId": msg.from_user_id,
                "toUserId": msg.to_user_id,
                "content": msg.content,
                "msgType": msg.msg_type,
                "isFromMe": False,  # 客户端根据自己的 userId 再判断
                "createTime": msg.create_time.isoformat() if msg.create_time else "",
                "conversationId": conversation_id,
            }
            return body, to_user_id

    # 在线程安全的同步块中操作数据库
    loop = asyncio.get_running_loop()
    body, to_user_id = await loop.run_in_executor(None, _sync)
    if not body:
        return

    # 广播给会话双方在线连接
    for uid in (from_user_id, to_user_id):
        conns = connections.get(uid) or set()
        if not conns:
            continue
        payload = {
            "type": "message",
            "message": {**body, "isFromMe": uid == from_user_id},
        }
        text = json.dumps(payload, ensure_ascii=False)
        await asyncio.gather(*(c.send(text) for c in list(conns)), return_exceptions=True)


async def main():
    host = "0.0.0.0"
    port = 5001
    async with websockets.serve(handle_connection, host, port, ping_interval=30):
        print(f"WebSocket server running on ws://{host}:{port}")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())

