from flask import Blueprint, request, current_app
import jwt
import requests
from app import db
from app.models import User

user_bp = Blueprint('user', __name__)


def get_current_user():
    auth = request.headers.get('Authorization')
    if not auth or not auth.startswith('Bearer '):
        return None
    token = auth[7:]
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return User.query.get(payload.get('user_id'))
    except:
        return None


@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    code = data.get('code')
    if not code:
        return {'message': '缺少 code'}, 400

    appid = current_app.config['WX_APPID']
    secret = current_app.config['WX_SECRET']
    if not appid or not secret:
        return {'message': '未配置微信 AppId/Secret'}, 500

    url = f'https://api.weixin.qq.com/sns/jscode2session?appid={appid}&secret={secret}&js_code={code}&grant_type=authorization_code'
    r = requests.get(url)
    wx_data = r.json()

    openid = wx_data.get('openid')
    if not openid:
        return {'message': wx_data.get('errmsg', '登录失败')}, 400

    user = User.query.filter_by(openid=openid).first()
    if not user:
        user = User(openid=openid)
        db.session.add(user)
        db.session.commit()

    token = jwt.encode(
        {'user_id': user.id},
        current_app.config['SECRET_KEY'],
        algorithm='HS256',
    )
    if isinstance(token, bytes):
        token = token.decode()
    return {'token': token, 'user': user.to_dict()}


@user_bp.route('/profile', methods=['GET'])
def get_profile():
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    return user.to_dict()


@user_bp.route('/profile', methods=['PUT'])
def update_profile():
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    data = request.get_json() or {}
    if 'nickName' in data:
        user.nick_name = data['nickName']
    if 'avatar' in data:
        user.avatar = data['avatar']
    if 'phone' in data:
        user.phone = data['phone']
    if 'campus' in data:
        user.campus = data['campus']
    db.session.commit()
    return user.to_dict()
