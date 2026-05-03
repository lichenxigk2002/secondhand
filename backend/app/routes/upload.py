import os
import uuid
from flask import Blueprint, request, current_app
from werkzeug.utils import secure_filename
from .user import get_current_user

upload_bp = Blueprint('upload', __name__)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
ALLOWED = {'jpg', 'jpeg', 'png', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED


@upload_bp.route('/image', methods=['POST'])
def upload_image():
    user = get_current_user()
    if not user:
        return {'message': '未登录'}, 401
    f = request.files.get('file')
    if not f:
        return {'message': '缺少文件'}, 400
    if not allowed_file(f.filename or ''):
        return {'message': '不允许的文件类型'}, 400
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = (f.filename or '').rsplit('.', 1)[-1].lower()
    name = f'{uuid.uuid4().hex}.{ext}'
    path = os.path.join(UPLOAD_DIR, name)
    f.save(path)
    
    # 改为返回相对路径，不再硬编码 IP 地址
    return {'url': f'/uploads/{name}'}
