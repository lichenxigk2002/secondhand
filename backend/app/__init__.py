import os
import traceback
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from config import Config

db = SQLAlchemy()
migrate = Migrate()
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins='*', supports_credentials=True)
    db.init_app(app)
    migrate.init_app(app, db)

    @app.before_request
    def _log_request():
        print(f"[Req] {request.method} {request.path}")

    @app.errorhandler(Exception)
    def _handle_exception(e):
        """全局异常：任何未捕获异常都返回 500，避免进程崩溃导致 502"""
        traceback.print_exc()
        return jsonify(message=f'服务器错误: {str(e)}'), 500

    from app.routes import user_bp, goods_bp
    from app.routes.upload import upload_bp
    from app.routes.favorite import favorite_bp
    from app.routes.message import message_bp
    from app.routes.order import order_bp
    from app.routes.evaluation import evaluation_bp
    from app.routes.browse import browse_bp
    from app.routes.report import report_bp
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(goods_bp, url_prefix='/api/goods')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(favorite_bp, url_prefix='/api/favorite')
    app.register_blueprint(message_bp, url_prefix='/api/message')
    app.register_blueprint(order_bp, url_prefix='/api/order')
    app.register_blueprint(evaluation_bp, url_prefix='/api/evaluation')
    app.register_blueprint(browse_bp, url_prefix='/api/browse')
    app.register_blueprint(report_bp, url_prefix='/api/report')

    @app.route('/api/ping', methods=['GET'])
    def ping():
        """健康检查：无需鉴权，用于确认后端是否可达（排查 502）"""
        return {'ok': True}

    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(UPLOAD_DIR, filename)

    return app
