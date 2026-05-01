from flask import Blueprint, jsonify, request

from app.services.ai_goods import generate_goods_draft, precheck_goods_publish


ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/goods-draft', methods=['POST'])
def goods_draft():
    try:
        data = request.get_json() or {}
        result = generate_goods_draft(data)
        return {'draft': result}
    except Exception as e:
        return jsonify(message=f'AI 生成失败: {str(e)}'), 500


@ai_bp.route('/goods-precheck', methods=['POST'])
def goods_precheck():
    try:
        data = request.get_json() or {}
        result = precheck_goods_publish(data)
        return {'result': result}
    except Exception as e:
        return jsonify(message=f'AI 审核失败: {str(e)}'), 500
